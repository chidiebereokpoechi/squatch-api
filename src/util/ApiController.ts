import { Get, Param } from '@nestjs/common'
import { Base } from '../database/entities/base.entity'
import { ApiService } from './ApiService'

export class ApiController<T extends Base> {
  protected readonly service!: ApiService<T>

  @Get()
  public list(): Promise<T[]> {
    return this.service.list()
  }

  @Get(':id')
  public retrieve(@Param('id') id: number): Promise<T> {
    return this.service.retrieve(id)
  }
}
