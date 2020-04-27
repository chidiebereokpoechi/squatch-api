import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Print, User } from '../database/entities'
import { PrintsRepository } from '../database/repositories'
import { CreatePrint } from '../model'
import { ApiRepository } from '../util/ApiRepository'
import { ApiService } from '../util/ApiService'

@Injectable()
export class PrintsService extends ApiService<Print, CreatePrint> {
  @InjectRepository(PrintsRepository)
  protected readonly repository!: ApiRepository<Print>

  public async create(model: CreatePrint, user: User): Promise<Print> {
    const print = this.repository.create(model)
    print.creator = user
    return this.repository.save(print)
  }

  public async like(id: number, user: User): Promise<Print> {
    const print = await this.retrieve(id, undefined, ['creator', 'likers'])
    return this.repository.save(print.addLiker(user))
  }

  public async unlike(id: number, user: User): Promise<Print> {
    const print = await this.retrieve(id, undefined, ['creator', 'likers'])
    return this.repository.save(print.removeLiker(user))
  }
}
