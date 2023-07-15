import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from 'src/schemas/doctor';

import { CreateDoctorBulkResponseDto } from './dto/create-bulk.res.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<DoctorDocument>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const checkIdExists = await this.doctorModel.findOne({
      id: createDoctorDto._id,
    });
    if (checkIdExists) throw new BadRequestException('Doctor already exists');

    const doctor = await new this.doctorModel(createDoctorDto).save();

    return new Doctor(doctor.toJSON());
  }

  async createBulk(createDoctorsDto: CreateDoctorDto[]) {
    const res: CreateDoctorBulkResponseDto = {
      invalidData: [],
      created: [],
      duplicated: [],
    };

    for (const value of createDoctorsDto) {
      const errors = await validate(plainToInstance(CreateDoctorDto, value));

      if (errors.length > 0) {
        res.invalidData.push(value);
        continue;
      }

      try {
        const doctor = await this.create(value);
        res.created.push(doctor);
      } catch (error) {
        res.duplicated.push(value);
      }
    }

    return res;
  }

  async clear(): Promise<number> {
    const res = await this.doctorModel.deleteMany({});

    return res.deletedCount;
  }
}
