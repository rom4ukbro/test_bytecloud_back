import { ApiProperty } from '@nestjs/swagger';
import { CreateAppointmentDto } from 'src/appointment/dto/create-appointment.dto';
import { Appointment } from 'src/schemas/appointment';

export class CreateAppointmentBulkResponseDto {
  @ApiProperty({ type: CreateAppointmentDto, isArray: true })
  invalidData: CreateAppointmentDto[];

  @ApiProperty({ type: Appointment, isArray: true })
  created: Appointment[];

  @ApiProperty({ type: CreateAppointmentDto, isArray: true })
  duplicated: CreateAppointmentDto[];
}
