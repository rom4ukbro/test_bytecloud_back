import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Document } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema({ _id: false, timestamps: true })
export class Doctor {
  @ApiHideProperty()
  @Exclude()
  @Prop({ required: true, type: Number })
  _id: number;

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  __v: number;

  @ApiProperty()
  @Prop({ required: true, type: Number })
  from: number;

  @ApiProperty()
  @Prop({ required: true, type: Number })
  to: number;

  @ApiProperty()
  @Prop({ required: false })
  name: string;

  @ApiProperty()
  @Prop({ required: false })
  birthday: Date;

  @ApiHideProperty()
  @Exclude()
  slots: number[];

  constructor(partial: Doctor) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  get id(): number {
    return this._id;
  }
}
export const DoctorSchema = SchemaFactory.createForClass(Doctor);
