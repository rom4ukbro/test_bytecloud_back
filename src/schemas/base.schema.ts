import { Prop, Schema } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BaseSchema<T> {
  @ApiHideProperty()
  @Prop({ type: SchemaTypes.ObjectId, default: () => new Types.ObjectId() })
  @Exclude({ toPlainOnly: true })
  _id: Types.ObjectId;

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  __v: number;

  @ApiProperty({ description: 'Created at', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', type: Date })
  updatedAt: Date;

  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  get id(): string {
    return String(this._id);
  }
}
