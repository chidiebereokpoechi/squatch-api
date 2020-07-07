import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import config from 'config'
import { omit } from 'lodash'
import { getCustomRepository, getRepository } from 'typeorm'
import { User } from '../database/entities'
import { Following } from '../database/entities/following.entity'
import { LoginsRepository } from '../database/repositories'
import { UsersRepository } from '../database/repositories/users.repository'
import { CreateUser } from '../model/users'
import { ApiRepository } from '../util/ApiRepository'
import { ApiService } from '../util/ApiService'

@Injectable()
export class UsersService extends ApiService<User, CreateUser> {
  @InjectRepository(UsersRepository)
  protected readonly repository!: ApiRepository<User>

  public async create(model: CreateUser) {
    const loginRepository = getCustomRepository(LoginsRepository)

    return this.repository.manager.transaction<User>(async () => {
      const login = await loginRepository.build(loginRepository.create(model), ['email'])
      return omit(
        await this.repository.build({ ...this.repository.create(model), login }, ['username']),
        ['login.password']
      ) as User
    })
  }

  public getFollowingQuery(followerId: number, followingId: number) {
    return this.repository
      .createQueryBuilder('user')
      .innerJoin('user.followings', 'followings')
      .where('followings.followingId = :followingId', { followingId })
      .andWhere('followings.followerId = :followerId', { followerId })
  }

  public async getFollowersOrFollowing(id: number, page?: number, isFollowing?: boolean) {
    const field = (following?: boolean) => (following ? 'following' : 'follower')
    const skip = page ? (page > 1 ? page - 1 : 0) : 0

    return await getRepository(Following)
      .createQueryBuilder('followings')
      .where(`followings.${field(!isFollowing)}Id = ${id}`)
      .leftJoinAndSelect(`followings.${field(isFollowing)}`, 'user')
      .select(['user.id as id', 'user.username as username', 'user.name as name'])
      .skip(skip)
      .take(config.get<number>('pagination.results'))
      .getRawMany()
  }

  public async getFollowers(id: number, page?: number) {
    return this.getFollowersOrFollowing(id, page)
  }

  public async getFollowing(id: number, page?: number) {
    return this.getFollowersOrFollowing(id, page, true)
  }

  public async follow(follower: User, followingId: number) {
    const isFollowing = await this.getFollowingQuery(follower.id, followingId).getOne()

    if (isFollowing) {
      throw new UnprocessableEntityException('Already following that user')
    }

    return this.repository.manager.transaction(async () => {
      await this.repository.query(
        ` INSERT INTO followings (followerId, followingId)
          VALUES (${follower.id}, ${followingId})
        `
      )

      await this.repository.query(
        ` UPDATE users
          SET followingCount = followingCount + 1
          WHERE id = ${follower.id}
        `
      )

      await this.repository.query(
        ` UPDATE users
          SET followersCount = followersCount + 1
          WHERE id = ${followingId}
        `
      )
    })
  }
}
