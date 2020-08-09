/* eslint-disable @typescript-eslint/no-unused-vars */
import { DeepPartial } from 'typeorm'
import { Base } from '../database/entities/base.entity'
import { ApiRepository } from './api-repository'

export class ApiService<
  T extends Base,
  CreateModel = DeepPartial<T>,
  _UpdateModel = DeepPartial<T>
> {
  protected readonly repository!: ApiRepository<T>

  public list(select?: (keyof T)[], relations?: (keyof T)[]): Promise<T[]> {
    return this.repository.find({ select, relations: relations as string[] })
  }

  public retrieve(id: number, select?: (keyof T)[], relations?: (keyof T)[]): Promise<T> {
    return this.repository.retrieve(id, select, relations)
  }

  public retrieveBy(
    subset: DeepPartial<T>,
    select?: (keyof T)[],
    relations?: (keyof T)[]
  ): Promise<T> {
    return this.repository.retrieveBy(subset, select, relations)
  }

  public create(model: CreateModel, ...args: unknown[]): Promise<T> {
    return this.repository.save(model)
  }

  public async checkBy(path: string, value: string): Promise<boolean> {
    const [relation, property] = path.split(':') as [string, string]
    const accessor = relation.length ? `${relation}.${property}` : property
    const response = await this.repository.checkBy(accessor, value, relation)
    return !!response
  }
}
