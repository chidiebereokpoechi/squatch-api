import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T = any> {
  data?: T
  ok: boolean
  status: number
  path?: string
  message?: string
  method?: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  public transform(request: Request, response: Response): (data: T) => ApiResponse<T> {
    return (data: T) =>
      ({
        data,
        ok: true,
        status: response.statusCode,
      } as ApiResponse<T>)
  }

  public intercept(host: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()

    return next.handle().pipe(map(this.transform(request, response)))
  }
}
