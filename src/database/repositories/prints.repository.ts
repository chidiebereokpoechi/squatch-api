import { EntityRepository } from 'typeorm'
import { ApiRepository } from '../../util/api-repository'
import { Print } from '../entities'

@EntityRepository(Print)
export class PrintsRepository extends ApiRepository<Print> {}
