import { EntityRepository } from 'typeorm'
import { ApiRepository } from '../../util/api-repository'
import { User } from '../entities'

@EntityRepository(User)
export class UsersRepository extends ApiRepository<User> {}
