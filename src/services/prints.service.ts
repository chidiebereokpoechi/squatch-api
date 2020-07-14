import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import config from 'config'
import { getCustomRepository, getRepository, Repository } from 'typeorm'
import { Following, Print, PrintLiking, User } from '../database/entities'
import { PrintsRepository, UsersRepository } from '../database/repositories'
import { CreatePrint } from '../model'
import { ApiRepository } from '../util/api-repository'
import { ApiService } from '../util/api-service'
import { CACHE_EXPIRATION_TIME } from '../util/constants'
import { paginate } from '../util/misc'

@Injectable()
export class PrintsService extends ApiService<Print, CreatePrint> {
  @InjectRepository(PrintsRepository)
  protected readonly repository!: ApiRepository<Print>
  protected readonly printLikingsRepository: Repository<PrintLiking>

  constructor() {
    super()
    this.printLikingsRepository = getRepository(PrintLiking)
  }

  public async getLikers(printId: number, userId: number, onlyPeopleFollowing = false, page = 1) {
    const NUMBER_TO_TAKE_FOR_LIKERS_FOLLOWING = 5
    const take = onlyPeopleFollowing
      ? NUMBER_TO_TAKE_FOR_LIKERS_FOLLOWING
      : config.get<number>('pagination.results')
    const skip = onlyPeopleFollowing ? 0 : (page - 1) * take

    let query = getCustomRepository(UsersRepository)
      .createQueryBuilder('users')
      .leftJoin(PrintLiking, 'print_likings', 'users.id = print_likings.likerId')
      .leftJoin(Following, 'followings', 'users.id = followings.followingId')
      .where('print_likings.printId = :printId', { printId })

    if (onlyPeopleFollowing) {
      query = query.andWhere('followings.followerId = :followerId', { followerId: userId })
    }

    return query
      .take(take)
      .skip(skip)
      .getMany()
  }

  public async getFeed(userId: number, page = 1) {
    const take = config.get<number>('pagination.results')
    const skip = (page - 1) * take

    const [prints, count] = await this.repository
      .createQueryBuilder('prints')
      .addSelect(
        `
          EXISTS (
            select * from print_likings where
            print_likings.printId = prints.id
            AND print_likings.likerId = ${userId}
          )
      `,
        'prints_userHasLiked'
      )
      .addSelect('prints.createdAt')
      .innerJoinAndSelect('prints.creator', 'creator')
      .leftJoin(Following, 'followings', 'creator.id = followings.followingId')
      .where('followings.followerId = :userId', { userId })
      .orWhere('creator.id = :userId', { userId })
      .skip(skip)
      .take(take)
      .cache(CACHE_EXPIRATION_TIME)
      .getManyAndCount()

    return paginate(prints, count, page)
  }

  public async create(model: CreatePrint, user: User): Promise<Print> {
    const print = this.repository.create(model)
    print.creator = user
    return this.repository.save(print)
  }

  public async isUserLiking(printId: number, likerId: number) {
    const likingQuery = {
      print: { id: printId },
      liker: { id: likerId },
    }

    return await this.printLikingsRepository.findOne({ where: likingQuery })
  }

  public async like(printId: number, likerId: number) {
    if (await this.isUserLiking(printId, likerId)) {
      throw new BadRequestException()
    }

    await this.repository.manager.transaction(async manager => {
      await manager.query(
        ` INSERT INTO print_likings (printId, likerId)
          VALUES (${printId}, ${likerId})
        `
      )

      await manager.query(
        ` UPDATE prints
          SET likeCount = likeCount + 1
          WHERE id = ${printId}
        `
      )
    })

    return this.retrieve(printId)
  }

  public async unlike(printId: number, likerId: number) {
    if (!(await this.isUserLiking(printId, likerId))) {
      throw new BadRequestException()
    }

    await this.repository.manager.transaction(async manager => {
      await manager.query(
        ` DELETE FROM print_likings
          WHERE printId = ${printId}
          AND likerId = ${likerId}
        `
      )

      await manager.query(
        ` UPDATE prints
          SET likeCount = likeCount - 1
          WHERE id = ${printId}
        `
      )
    })

    return this.retrieve(printId)
  }
}
