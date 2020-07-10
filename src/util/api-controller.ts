import { Get, Param } from '@nestjs/common'
import { Base } from '../database/entities/base.entity'
import { ApiService } from './api-service'

export class ApiController<T extends Base> {
  protected readonly service!: ApiService<T>

  @Get()
  public list(): Promise<T[]> {
    return this.service.list()
  }

  @Get(':id')
  public retrieve(@Param('id') id: number | any): Promise<T> {
    return this.service.retrieve(id)
  }
}
