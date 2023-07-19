import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GetAppointmentsResponseDto } from 'src/appointment/dto/get-appointments.res.dto';

@WebSocketGateway({ cors: true })
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  @OnEvent('appointments.send')
  emitAppointment(body: GetAppointmentsResponseDto) {
    this.server.emit('appointmentsChange', body);
  }
}
