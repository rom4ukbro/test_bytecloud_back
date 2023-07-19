import { ApiProperty } from '@nestjs/swagger';
import { AggregatedAppointment, Appointment } from 'src/schemas/appointment';

export class GetAppointmentsResponseDto {
  @ApiProperty({ type: Appointment, isArray: true })
  appointments: AggregatedAppointment[];

  @ApiProperty({ type: Appointment, isArray: true })
  optimizeAppointments: AggregatedAppointment[];
}
