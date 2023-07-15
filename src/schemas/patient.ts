import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
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
  @Prop({ required: false, type: String })
  name?: string;

  @ApiProperty()
  @Prop({ required: false, type: Date })
  birthday?: Date;

  @ApiProperty()
  @Exclude()
  slots: number[];

  constructor(partial: Patient) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  get id(): number {
    return this._id;
  }
}
export const PatientSchema = SchemaFactory.createForClass(Patient);
