import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { assign } from 'lodash'
import { DeepPartial, Repository } from 'typeorm'
import { Base } from '../database/entities/base.entity'

export class ApiRepository<T extends Base> extends Repository<T> {
  public async build(model: DeepPartial<T>, uniqueFields: (keyof T)[] = []): Promise<T> {
    for (const field of uniqueFields) {
      if (await this.findOne({ [field]: model[field] })) {
        return Promise.reject(
          new UnprocessableEntityException(
            `${this.metadata.name} with ${field} [${model[field]}] already exists`
          )
        )
      }
    }

    return this.save(model)
  }

  public async patch(
    id: number,
    model: DeepPartial<T>,
    select?: (keyof T)[],
    relations?: (keyof T)[]
  ): Promise<DeepPartial<T>> {
    const entity = await this.retrieve(id, select, relations)
    assign(entity, model)
    return this.save(entity as any)
  }

  public async retrieveBy(
    subset: DeepPartial<T>,
    select?: (keyof T)[],
    relations?: (keyof T)[]
  ): Promise<T> {
    try {
      return await this.findOneOrFail({
        where: subset,
        select,
        relations: relations as string[],
      })
    } catch (e) {
      throw new NotFoundException(new Error(`${this.metadata.name} does not exist`))
    }
  }

  public async retrieve(id: number, select?: (keyof T)[], relations?: (keyof T)[]): Promise<T> {
    return this.retrieveBy({ id } as any, select, relations)
  }

  public async checkBy(path: string, value: string, relation?: string) {
    const entityName = this.metadata.name.toLowerCase()
    const query = this.createQueryBuilder(entityName)

    if (relation) {
      query.innerJoinAndSelect(`${entityName}.${relation}`, relation)
    }

    return query.where(`${path} = :value`, { path, value }).getOne()
  }
}
