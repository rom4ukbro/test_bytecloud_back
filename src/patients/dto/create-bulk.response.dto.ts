import { ApiProperty } from '@nestjs/swagger';
import { Patient } from 'src/schemas/patient';

import { CreatePatientDto } from './create-patient.dto';

export class CreatePatientBulkResponseDto {
  @ApiProperty({ type: CreatePatientDto, isArray: true })
  invalidData: CreatePatientDto[];

  @ApiProperty({ type: Patient, isArray: true })
  created: Patient[];

  @ApiProperty({ type: CreatePatientDto, isArray: true })
  duplicated: CreatePatientDto[];
}
