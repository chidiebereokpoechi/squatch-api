import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from '../../services'
import { InvalidSessionUser } from '../errors'
import { ApiResponse } from '../interceptors'

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  @Inject(AuthService)
  protected readonly authService!: AuthService

  public catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response<ApiResponse>>()

    if (exception instanceof InvalidSessionUser) {
      this.authService.logout(request)
      return response.status(exception.status).json({
        ok: false,
        path: request.url,
        status: exception.status,
        message: 'Authenticated user does not exist',
      })
    }

    const errorInfo =
      exception instanceof HttpException
        ? exception instanceof BadRequestException
          ? {
              status: exception.getStatus(),
              message: exception.message,
              errors: (exception.getResponse() as any).message,
            }
          : { status: exception.getStatus(), message: exception.message }
        : {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception.message || 'Yikes! Unknown error occured',
          }

    response.status(errorInfo.status).json({
      ok: false,
      path: request.url,
      method: request.method,
      ...errorInfo,
    })
  }
}
