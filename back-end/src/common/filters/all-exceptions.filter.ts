import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    // Log detalhado do erro
    this.logger.error('=== EXCEPTION CAUGHT ===');
    this.logger.error(`Path: ${request.method} ${request.url}`);
    this.logger.error(`Status: ${status}`);
    this.logger.error(`Message: ${JSON.stringify(message)}`);

    if (exception instanceof Error) {
      this.logger.error(`Error name: ${exception.name}`);
      this.logger.error(`Error message: ${exception.message}`);
      this.logger.error(`Stack trace: ${exception.stack}`);
    } else {
      this.logger.error(`Exception (non-Error): ${JSON.stringify(exception)}`);
    }

    // Log do body da requisição (útil para debug de uploads)
    if (request.body) {
      this.logger.error(`Request body keys: ${Object.keys(request.body).join(', ')}`);
    }

    // Log de arquivos (para multipart/form-data)
    const file = (request as any).file;
    if (file) {
      this.logger.error(`File info: ${JSON.stringify({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })}`);
    }

    this.logger.error('=== END EXCEPTION ===');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' ? message : { error: message },
    });
  }
}
