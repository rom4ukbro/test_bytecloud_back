import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from 'src/schemas/patient';

import { CreatePatientBulkResponseDto } from './dto/create-bulk.response.dto';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const checkIdExists = await this.patientModel.findOne({
      id: createPatientDto._id,
    });
    if (checkIdExists) throw new BadRequestException('Patient already exists');

    const patient = await new this.patientModel(createPatientDto).save();

    return new Patient(patient.toJSON());
  }

  async createBulk(createPatientsDto: CreatePatientDto[]) {
    const res: CreatePatientBulkResponseDto = {
      invalidData: [],
      created: [],
      duplicated: [],
    };

    for (const value of createPatientsDto) {
      const errors = await validate(plainToInstance(CreatePatientDto, value));

      if (errors.length > 0) {
        res.invalidData.push(value);
        continue;
      }

      try {
        const patient = await this.create(value);
        res.created.push(patient);
      } catch (error) {
        res.duplicated.push(value);
      }
    }

    return res;
  }

  async clear(): Promise<number> {
    const res = await this.patientModel.deleteMany({});

    return res.deletedCount;
  }
}
