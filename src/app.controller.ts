import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { CreateBulkDto } from './common/dto/create-bulk.dto';
import { CreateBulkResponseDto } from './common/dto/create-bulk.res.dto';

@ApiTags('App')
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('bulk')
  async createBulk(
    @Body() body: CreateBulkDto,
  ): Promise<CreateBulkResponseDto> {
    return this.appService.createBulk(body);
  }

  @Delete('clear')
  @ApiOkResponse({
    schema: {
      properties: {
        appointments: { type: 'number' },
        doctors: { type: 'number' },
        patients: { type: 'number' },
      },
    },
  })
  async clear() {
    return this.appService.clear();
  }
}
