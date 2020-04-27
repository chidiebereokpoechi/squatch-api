import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { omit } from 'lodash'
import { getRepository } from 'typeorm'
import { User } from '../database/entities'
import { Login } from '../database/entities/login.entity'
import { UsersRepository } from '../database/repositories/users.repository'
import { CreateUser } from '../model/users'
import { ApiRepository } from '../util/ApiRepository'
import { ApiService } from '../util/ApiService'

@Injectable()
export class UsersService extends ApiService<User, CreateUser> {
  @InjectRepository(UsersRepository)
  protected readonly repository!: ApiRepository<User>

  public async create(model: CreateUser) {
    const loginRepository = getRepository(Login)

    return this.repository.manager.transaction<User>(async () => {
      const login = await loginRepository.save(loginRepository.create(model))
      return omit(await this.repository.save({ ...this.repository.create(model), login }), [
        'login.password',
      ]) as User
    })
  }

  public getFollowingQuery(followerId: number, followingId: number) {
    return this.repository
      .createQueryBuilder('user')
      .innerJoin('user.followings', 'followings')
      .where('followings.followingId = :followingId', { followingId })
      .andWhere('followings.followerId = :followerId', { followerId })
  }

  public async getFollowersFollowing(id: number, page?: number, following?: boolean) {
    return await this.repository
      .createQueryBuilder('user')
      .innerJoin('user.followings', 'followings')
      .select(['user.id', 'user.name', 'user.username'])
      .where(`followings.${following ? 'followingId' : 'followerId'} = :id`, { id })
      .take(10)
      .skip(((page || 1) - 1) * 10)
      .getMany()
  }

  public async getFollowers(id: number, page?: number) {
    return this.getFollowersFollowing(id, page)
  }

  public async getFollowing(id: number, page?: number) {
    return this.getFollowersFollowing(id, page, true)
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
