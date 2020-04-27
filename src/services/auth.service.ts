import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import { omit } from 'lodash'
import { Login, User } from '../database/entities'
import { LoginsRepository, UsersRepository } from '../database/repositories'
import { ApiRepository } from '../util/ApiRepository'

@Injectable()
export class AuthService {
  @InjectRepository(UsersRepository)
  protected readonly usersRepository!: ApiRepository<User>

  @InjectRepository(LoginsRepository)
  protected readonly loginsRepository!: ApiRepository<Login>

  public async validateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.login', 'login')
      .where('user.username = :usernameOrEmail', { usernameOrEmail })
      .orWhere('login.email = :usernameOrEmail', { usernameOrEmail })
      .getOne()

    if (!user || user.login.password !== password) {
      return null
    }

    return omit(user, 'login.password') as User
  }

  public logout(request: Request) {
    request.session?.destroy(() => {
      request.logOut()
    })
  }
}
