import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { DoctorsService } from './doctors.service';
import { CreateDoctorBulkResponseDto } from './dto/create-bulk.res.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@ApiTags('Doctors')
@Controller('doctors')
@UseInterceptors(ClassSerializerInterceptor)
export class DoctorsController {
  constructor(private service: DoctorsService) {}

  @Post()
  create(@Body() doctor: CreateDoctorDto) {
    return this.service.create(doctor);
  }

  @Post('bulk')
  @ApiBody({ type: CreateDoctorDto, isArray: true })
  async createBulk(
    @Body() doctors: CreateDoctorDto[],
  ): Promise<CreateDoctorBulkResponseDto> {
    return this.service.createBulk(doctors);
  }
}
