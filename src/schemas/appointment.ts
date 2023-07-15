import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { AppointmentStatusEnum } from 'src/appointment/enum/status.enum';

import { Doctor } from './doctor';
import { Patient } from './patient';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @ApiHideProperty()
  @Prop({ type: SchemaTypes.ObjectId, default: () => new Types.ObjectId() })
  @Exclude({ toPlainOnly: true })
  _id?: Types.ObjectId;

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  __v?: number;

  @ApiProperty()
  @Prop({ required: true })
  patient: number;

  @ApiProperty()
  @Prop({ required: true })
  doctor: number;

  @ApiProperty()
  @Prop({ required: false })
  time: number;

  @ApiProperty()
  @Prop({ required: true, enum: AppointmentStatusEnum, type: String })
  status: string;

  @ApiProperty()
  @Exclude()
  decided?: boolean;

  @ApiHideProperty()
  @Exclude()
  originalTime?: number;

  constructor({ id, ...partial }: Partial<Appointment>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  get id(): string {
    return String(this._id);
  }
}

export class AggregatedAppointment extends OmitType(Appointment, [
  'patient',
  'doctor',
]) {
  @ApiProperty()
  patient: Patient;

  @ApiProperty()
  doctor: Doctor;

  constructor({ id, ...partial }: Partial<AggregatedAppointment>) {
    super();
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  get id(): string {
    return String(this._id);
  }
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
