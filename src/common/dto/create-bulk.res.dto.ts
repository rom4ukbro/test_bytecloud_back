import { ApiProperty } from '@nestjs/swagger';
import { CreateAppointmentBulkResponseDto } from 'src/appointment/dto/create-bulk.res.dto';
import { CreateDoctorBulkResponseDto } from 'src/doctors/dto/create-bulk.res.dto';
import { CreatePatientBulkResponseDto } from 'src/patients/dto/create-bulk.response.dto';

export class CreateBulkResponseDto {
  @ApiProperty({ type: CreateAppointmentBulkResponseDto })
  appointments: CreateAppointmentBulkResponseDto;

  @ApiProperty({ type: CreateDoctorBulkResponseDto })
  doctors: CreateDoctorBulkResponseDto;

  @ApiProperty({ type: CreatePatientBulkResponseDto })
  patients: CreatePatientBulkResponseDto;
}
