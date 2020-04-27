import { EntityRepository } from 'typeorm'
import { ApiRepository } from '../../util/ApiRepository'
import { Print } from '../entities'

@EntityRepository(Print)
export class PrintsRepository extends ApiRepository<Print> {}
