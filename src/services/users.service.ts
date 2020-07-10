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
import { ApiRepository } from '../util/api-repository'
import { ApiService } from '../util/api-service'

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

  public async getFollowersOrFollowing(id: number, page = 1, isFollowing = false) {
    const field = (following?: boolean) => (following ? 'following' : 'follower')
    const take = config.get<number>('pagination.results')
    const skip = (page - 1) * take

    return await getRepository(Following)
      .createQueryBuilder('followings')
      .where(`followings.${field(!isFollowing)}Id = ${id}`)
      .leftJoinAndSelect(`followings.${field(isFollowing)}`, 'user')
      .select(['user.id as id', 'user.username as username', 'user.name as name'])
      .take(take)
      .skip(skip)
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

    return this.repository.manager.transaction(async manager => {
      await manager.query(
        ` INSERT INTO followings (followerId, followingId)
          VALUES (${follower.id}, ${followingId})
        `
      )

      await manager.query(
        ` UPDATE users
          SET followingCount = followingCount + 1
          WHERE id = ${follower.id}
        `
      )

      await manager.query(
        ` UPDATE users
          SET followersCount = followersCount + 1
          WHERE id = ${followingId}
        `
      )
    })
  }
}
