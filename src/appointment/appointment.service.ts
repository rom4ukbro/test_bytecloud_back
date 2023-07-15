import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Model, Types } from 'mongoose';
import { AppointmentStatusEnum } from 'src/appointment/enum/status.enum';
import {
  AggregatedAppointment,
  Appointment,
  AppointmentDocument,
} from 'src/schemas/appointment';
import { Doctor, DoctorDocument } from 'src/schemas/doctor';
import { Patient, PatientDocument } from 'src/schemas/patient';

import { AppointmentPipeline } from './appointment.pipeline';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateAppointmentBulkResponseDto } from './dto/create-bulk.res.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patient: patientId, doctor: doctorId, time } = createAppointmentDto;
    let status = AppointmentStatusEnum.GREEN;

    if (!time) {
      status = AppointmentStatusEnum.RED;
    } else {
      const [doctor, patient] = await Promise.all([
        this.doctorModel.findOne({
          _id: doctorId,
          from: { $lte: time },
          to: { $gt: time },
        }),
        this.patientModel.findOne({
          _id: patientId,
          from: { $lte: time },
          to: { $gt: time },
        }),
      ]);

      if (!doctor || !patient) {
        status = AppointmentStatusEnum.RED;
      } else {
        const updated = await this.appointmentModel.updateMany(
          {
            $or: [
              { patient, time },
              { doctor, time },
            ],
          },
          { status: AppointmentStatusEnum.YELLOW },
        );

        if (updated.modifiedCount > 0) {
          status = AppointmentStatusEnum.YELLOW;
        }
      }
    }

    const appointment = await this.appointmentModel.create({
      ...createAppointmentDto,
      status,
    });

    return new Appointment(appointment.toJSON());
  }

  async createBulk(createAppointmentsDto: CreateAppointmentDto[]) {
    const res: CreateAppointmentBulkResponseDto = {
      invalidData: [],
      created: [],
      duplicated: [],
    };

    for (const value of createAppointmentsDto) {
      const errors = await validate(
        plainToInstance(CreateAppointmentDto, value),
      );

      if (errors.length > 0) {
        res.invalidData.push(value);
        continue;
      }

      try {
        const appointment = await this.create(value);
        res.created.push(appointment);
      } catch (error) {
        res.duplicated.push(value);
      }
    }

    return res;
  }

  async getAll(): Promise<AggregatedAppointment[]> {
    const appointments =
      await this.appointmentModel.aggregate<AggregatedAppointment>([
        {
          $sort: {
            patient: 1,
            doctor: 1,
            time: 1,
          },
        },
        ...AppointmentPipeline.lookupDoctors(),
        ...AppointmentPipeline.lookupPatients(),
      ]);
    const models = appointments.map(
      (appointment) => new AggregatedAppointment(appointment),
    );

    return models;
  }

  getOptimize(appointments: AggregatedAppointment[]): AggregatedAppointment[] {
    const doctorsList: Map<number, Doctor> = new Map();
    const patientsList: Map<number, Patient> = new Map();

    appointments = appointments.map((appointment) => {
      const { doctor, patient } = appointment;

      appointment.originalTime = appointment.time;
      if (!doctor || !patient) return appointment;

      const doctorSlots = Array.from(
        { length: doctor.to - doctor.from },
        (_, i) => i + doctor.from,
      );
      doctor.slots = doctorSlots;
      doctorsList.set(doctor.id, doctor);

      const patientSlots = Array.from(
        { length: patient.to - patient.from },
        (_, i) => i + patient.from,
      );
      patient.slots = patientSlots;
      patientsList.set(patient.id, patient);

      return appointment;
    });

    let prevAppointments = appointments;
    let currentAppointments = prevAppointments;
    const bestOptimizingResults: Map<number, AggregatedAppointment[]> =
      new Map();

    let loopCount = 0;

    do {
      prevAppointments = currentAppointments;
      const withoutTime = this.changeAndExecuteSchedule({
        appointments: currentAppointments.map(({ time, ...appointment }) => ({
          ...appointment,
          id: String(appointment._id),
          originalTime: null,
          bufferTime: time,
        })),
        doctorsList,
        patientsList,
      });
      const withTime = this.changeAndExecuteSchedule({
        appointments: currentAppointments,
        doctorsList,
        patientsList,
      });

      if (withTime.score >= withoutTime.score) {
        currentAppointments = withTime.appointments;
      } else {
        currentAppointments = withoutTime.appointments.map(
          ({
            bufferTime,
            ...appointment
          }: AggregatedAppointment & { bufferTime: number }) => ({
            ...appointment,
            id: String(appointment._id),
            originalTime: bufferTime,
          }),
        );
      }
      bestOptimizingResults.set(
        Math.max(withTime.score, withoutTime.score),
        currentAppointments,
      );
      loopCount++;
    } while (
      !this.checkEqual(prevAppointments, currentAppointments) &&
      loopCount < 1_000
    );

    const bestAppointmentSchedule: AggregatedAppointment[] =
      bestOptimizingResults.get(Math.max(...bestOptimizingResults.keys()));

    type AppointmentDeepSort<T extends keyof AggregatedAppointment> =
      | keyof AggregatedAppointment
      | Record<T, keyof AggregatedAppointment[T]>;

    const sortOrder: (
      | AppointmentDeepSort<'patient'>
      | AppointmentDeepSort<'doctor'>
    )[] = [{ patient: 'id' }, { doctor: 'id' }, 'time'];

    const modifiedAppointment = bestAppointmentSchedule
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(
        ({ decided, originalTime, ...appointment }) =>
          new AggregatedAppointment(appointment),
      )
      .sort((a, b) => {
        let order = 0;
        for (const key of sortOrder) {
          if (typeof key === 'string') {
            const aValue = a[key];
            const bValue = b[key];

            if (aValue > bValue) {
              order = 1;
            } else if (aValue < bValue) {
              order = -1;
            }
          } else {
            for (const [subKey, subValue] of Object.entries(key)) {
              const aValue = a[subKey]?.[subValue];
              const bValue = b[subKey]?.[subValue];

              if (!aValue) order = 1;
              else if (!bValue) order = -1;

              if (aValue > bValue) {
                order = 1;
              } else if (aValue < bValue) {
                order = -1;
              }
            }
          }
          if (order !== 0) {
            break;
          }
        }
        return order;
      });

    return modifiedAppointment;
  }

  async clear(): Promise<number> {
    const res = await this.appointmentModel.deleteMany({});

    return res.deletedCount;
  }

  async updateBulk(updateAppointmentsDto: UpdateAppointmentDto[]) {
    const promises: Promise<unknown>[] = [];
    for (const { id, ...appointment } of updateAppointmentsDto) {
      if (appointment.status === AppointmentStatusEnum.BLUE) {
        appointment.status = AppointmentStatusEnum.GREEN;
      }
      promises.push(
        this.appointmentModel.updateOne(
          { _id: new Types.ObjectId(id) },
          { $set: appointment },
        ),
      );
    }

    await Promise.all(promises);
  }

  private changeAndExecuteSchedule({
    appointments,
    doctorsList,
    patientsList,
  }: {
    appointments: (Omit<AggregatedAppointment, 'time'> & { time?: number })[];
    doctorsList: Map<number, Doctor>;
    patientsList: Map<number, Patient>;
  }): { score: number; appointments: AggregatedAppointment[] } {
    const sortObj = {
      [AppointmentStatusEnum.RED]: -2,
      [AppointmentStatusEnum.YELLOW]: -1,
      [AppointmentStatusEnum.BLUE]: 0,
      [AppointmentStatusEnum.GREEN]: 0,
    };
    appointments = appointments
      .map((appointment) => ({
        ...appointment,
        decided: false,
      }))
      .sort((a, b) => sortObj[a.status] - sortObj[b.status]);

    const patients: Record<string, Patient> = JSON.parse(
      JSON.stringify(Object.fromEntries(patientsList)),
    );
    const doctors: Record<string, Doctor> = JSON.parse(
      JSON.stringify(Object.fromEntries(doctorsList)),
    );

    appointments.forEach(() => {
      if (appointments.every(({ decided }) => decided)) return;

      const appointmentSlots = appointments
        .filter(({ decided }) => !decided)
        .map((appointment) => {
          if (!appointment.patient || !appointment.doctor) {
            return {
              slots: [],
            };
          }
          const patient = patients[appointment.patient.id];
          const doctor = doctors[appointment.doctor.id];

          let slots = [];
          if (patient?.slots && doctor.slots) {
            slots = patient.slots.filter((slot) => doctor.slots.includes(slot));
          }

          return {
            patient,
            doctor,
            slots,
            appointment,
          };
        })
        .filter(({ slots }) => slots.length > 0)
        .sort((a, b) => {
          let order: number;
          if (a.appointment.status !== b.appointment.status) {
            order =
              sortObj[a.appointment.status] - sortObj[b.appointment.status];
          } else {
            order = a.slots.length - b.slots.length;
          }

          return order;
        });

      if (appointmentSlots.length == 0) {
        appointments
          .filter(({ decided }) => !decided)
          .forEach((appointment) => {
            appointment.status = AppointmentStatusEnum.RED;
          });
      } else {
        const firstAppointmentSlot = appointmentSlots[0];

        const foundAppointment = firstAppointmentSlot.appointment;
        foundAppointment.decided = true;

        const hasAvailableSlot = firstAppointmentSlot.slots.includes(
          foundAppointment.originalTime,
        );

        const selectedSlot = hasAvailableSlot
          ? foundAppointment.originalTime
          : firstAppointmentSlot.slots.at(-1);

        foundAppointment.status = hasAvailableSlot
          ? AppointmentStatusEnum.GREEN
          : AppointmentStatusEnum.BLUE;

        foundAppointment.time = selectedSlot;

        firstAppointmentSlot.patient.slots =
          firstAppointmentSlot.patient.slots.filter(
            (slot) => slot !== selectedSlot,
          );

        firstAppointmentSlot.doctor.slots =
          firstAppointmentSlot.doctor.slots.filter(
            (slot) => slot !== selectedSlot,
          );
      }
    });

    const scoreResults = {
      [AppointmentStatusEnum.RED]: 0,
      [AppointmentStatusEnum.BLUE]: 0,
      [AppointmentStatusEnum.GREEN]: 0,
    };

    for (const appointment of appointments) {
      scoreResults[appointment.status]++;
    }

    const { green, blue, red } = scoreResults;

    const score =
      green - (blue + red * appointments.length) * appointments.length;

    return { score, appointments: appointments as AggregatedAppointment[] };
  }

  private checkEqual(
    appointments: Pick<Appointment, 'status'>[],
    newAppointments: Pick<Appointment, 'status'>[],
  ) {
    const scoreResultsOld = {
      [AppointmentStatusEnum.RED]: 0,
      [AppointmentStatusEnum.BLUE]: 0,
      [AppointmentStatusEnum.GREEN]: 0,
      [AppointmentStatusEnum.YELLOW]: 0,
    };

    for (const appointment of appointments) {
      scoreResultsOld[appointment.status]++;
    }

    const scoreResultsNew = {
      [AppointmentStatusEnum.RED]: 0,
      [AppointmentStatusEnum.BLUE]: 0,
      [AppointmentStatusEnum.GREEN]: 0,
      [AppointmentStatusEnum.YELLOW]: 0,
    };

    for (const appointment of newAppointments) {
      scoreResultsNew[appointment.status]++;
    }

    for (const status in scoreResultsOld) {
      if (scoreResultsOld[status] !== scoreResultsNew[status]) {
        return false;
      }
    }

    return true;
  }
}
