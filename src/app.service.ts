import { Injectable } from '@nestjs/common';
import { AppointmentService } from 'src/appointment/appointment.service';
import { CreateBulkDto } from 'src/common/dto/create-bulk.dto';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';

import { GetAppointmentsResponseDto } from './appointment/dto/get-appointments.res.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly appointmentsService: AppointmentService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
  ) {}

  async createBulk(body: CreateBulkDto) {
    const res = {
      doctors: await this.doctorsService.createBulk(body.doctors),
      patients: await this.patientsService.createBulk(body.patients),
      appointments: await this.appointmentsService.createBulk(
        body.appointments,
      ),
    };

    return res;
  }

  async clear() {
    const appointmentsCount = await this.appointmentsService.clear();
    const doctorsCount = await this.doctorsService.clear();
    const patientsCount = await this.patientsService.clear();

    return {
      appointments: appointmentsCount,
      doctors: doctorsCount,
      patients: patientsCount,
    };
  }

  async getAppointments(): Promise<GetAppointmentsResponseDto> {
    const appointments = await this.appointmentsService.getAll();
    const optimizeAppointments =
      this.appointmentsService.getOptimize(appointments);

    return {
      appointments,
      optimizeAppointments,
    };
  }
}
