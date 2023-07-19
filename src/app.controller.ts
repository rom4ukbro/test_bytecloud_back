import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { CreateBulkDto } from './common/dto/create-bulk.dto';
import { CreateBulkResponseDto } from './common/dto/create-bulk.res.dto';

@ApiTags('App')
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('bulk')
  async createBulk(
    @Body() body: CreateBulkDto,
  ): Promise<CreateBulkResponseDto> {
    const res = await this.appService.createBulk(body);

    const appointments = await this.appService.getAppointments();
    this.eventEmitter.emit('appointments.send', appointments);

    return res;
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
    const res = await this.appService.clear();

    this.eventEmitter.emit('appointments.send', {
      appointments: [],
      optimizeAppointments: [],
    });

    return res;
  }
}
