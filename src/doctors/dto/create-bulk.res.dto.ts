import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from 'src/schemas/doctor';

import { CreateDoctorDto } from './create-doctor.dto';

export class CreateDoctorBulkResponseDto {
  @ApiProperty({ type: CreateDoctorDto, isArray: true })
  invalidData: CreateDoctorDto[];

  @ApiProperty({ type: Doctor, isArray: true })
  created: Doctor[];

  @ApiProperty({ type: CreateDoctorDto, isArray: true })
  duplicated: CreateDoctorDto[];
}
