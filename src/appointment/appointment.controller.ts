import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAppointmentDto } from 'src/appointment/dto/create-appointment.dto';

import { AppointmentService } from './appointment.service';
import { CreateAppointmentBulkResponseDto } from './dto/create-bulk.res.dto';
import { GetAppointmentsResponseDto } from './dto/get-appointments.res.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('Appointments')
@Controller('appointments')
@UseInterceptors(ClassSerializerInterceptor)
export class AppointmentController {
  constructor(private service: AppointmentService) {}

  @Post()
  async create(@Body() appointment: CreateAppointmentDto) {
    return this.service.create(appointment);
  }

  @Post('bulk')
  @ApiBody({ type: CreateAppointmentDto, isArray: true })
  async createBulk(
    @Body() appointments: CreateAppointmentDto[],
  ): Promise<CreateAppointmentBulkResponseDto> {
    return this.service.createBulk(appointments);
  }

  @Get()
  async getAppointments(): Promise<GetAppointmentsResponseDto> {
    const appointments = await this.service.getAll();
    const optimizeAppointments = this.service.getOptimize(appointments);

    return { appointments, optimizeAppointments };
  }

  @Put('bulk')
  async updateBulk(@Body() appointments: UpdateAppointmentDto[]) {
    const valid: UpdateAppointmentDto[] = [];

    for (const appointment of appointments) {
      const errors = await validate(
        plainToClass(UpdateAppointmentDto, appointment),
      );

      if (errors.length === 0) {
        valid.push(appointment);
      }
    }

    return this.service.updateBulk(valid);
  }
}
