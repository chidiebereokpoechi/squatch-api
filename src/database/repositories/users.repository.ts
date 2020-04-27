import { EntityRepository } from 'typeorm'
import { ApiRepository } from '../../util/ApiRepository'
import { User } from '../entities'

@EntityRepository(User)
export class UsersRepository extends ApiRepository<User> {}
