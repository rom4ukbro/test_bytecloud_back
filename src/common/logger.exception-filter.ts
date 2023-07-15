import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class LogExceptionFilter implements ExceptionFilter {
  private logger = new Logger(LogExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const req = host.switchToHttp().getRequest();

    const status = exception.getStatus();
    if (status >= 500) {
      this.logger.error(exception.getResponse());
      if (Object.keys(req.body).length > 0) {
        this.logger.error('Body:', req.body);
      }
    }

    res.status(status).send(exception.getResponse());
  }
}
