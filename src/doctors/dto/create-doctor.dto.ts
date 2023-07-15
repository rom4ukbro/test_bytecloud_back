import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { NumberLessThan } from 'src/common/validators/number-less-than.validator';

export class CreateDoctorDto {
  @ApiProperty()
  @Min(0)
  @IsInt()
  _id: number;

  @ApiProperty()
  @NumberLessThan<CreateDoctorDto>('to')
  @Min(0)
  @Max(23)
  @IsInt()
  from: number;

  @ApiProperty()
  @Min(0)
  @Max(23)
  @IsInt()
  to: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthday: Date;
}
