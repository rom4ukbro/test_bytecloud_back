import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { CreatePatientBulkResponseDto } from './dto/create-bulk.response.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';

@ApiTags('Patients')
@Controller('patients')
@UseInterceptors(ClassSerializerInterceptor)
export class PatientsController {
  constructor(private service: PatientsService) {}

  @Post()
  createPatient(@Body() patient: CreatePatientDto) {
    return this.service.create(patient);
  }

  @Post('bulk')
  @ApiBody({ type: CreatePatientDto, isArray: true })
  async create(
    @Body() patients: CreatePatientDto[],
  ): Promise<CreatePatientBulkResponseDto> {
    return this.service.createBulk(patients);
  }
}
