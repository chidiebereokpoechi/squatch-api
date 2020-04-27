import { EntityRepository } from 'typeorm'
import { ApiRepository } from '../../util/ApiRepository'
import { Login } from '../entities'

@EntityRepository(Login)
export class LoginsRepository extends ApiRepository<Login> {}
