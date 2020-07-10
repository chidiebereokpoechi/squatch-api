import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Paginated } from '../misc'
import { AcceptableReturn, ApiResponse } from '../types/api-response'

@Injectable()
export class TransformInterceptor<T extends AcceptableReturn>
  implements NestInterceptor<T, ApiResponse> {
  public transform(request: Request, response: Response): (data: T) => ApiResponse {
    return (data: any) => {
      if (data instanceof Paginated) {
        return {
          data: data.data,
          meta: data.meta,
          ok: true,
          status: response.statusCode,
        } as ApiResponse
      }

      return {
        data,
        ok: true,
        status: response.statusCode,
      } as ApiResponse
    }
  }

  public intercept(host: ExecutionContext, next: CallHandler): Observable<ApiResponse> {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()

    return next.handle().pipe(map(this.transform(request, response)))
  }
}
