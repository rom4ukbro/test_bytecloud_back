import { ApiProperty } from '@nestjs/swagger';
import { CreateAppointmentDto } from 'src/appointment/dto/create-appointment.dto';
import { CreateDoctorDto } from 'src/doctors/dto/create-doctor.dto';
import { CreatePatientDto } from 'src/patients/dto/create-patient.dto';

export class CreateBulkDto {
  @ApiProperty({ type: CreateAppointmentDto, isArray: true })
  appointments: CreateAppointmentDto[];

  @ApiProperty({ type: CreateDoctorDto, isArray: true })
  doctors: CreateDoctorDto[];

  @ApiProperty({ type: CreatePatientDto, isArray: true })
  patients: CreatePatientDto[];
}
