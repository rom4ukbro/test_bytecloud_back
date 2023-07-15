import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { AppointmentStatusEnum } from '../enum/status.enum';

export class CreateAppointmentDto {
  @ApiProperty()
  @Min(0)
  @IsInt()
  patient: number;

  @ApiProperty()
  @Min(0)
  @IsInt()
  doctor: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  time: number;

  @ApiHideProperty()
  status: AppointmentStatusEnum;
}
