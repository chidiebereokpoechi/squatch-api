import config from 'config'
import { ApiResponseMetadata } from '../types/api-response'

export class Paginated<Entity> {
  public data!: Entity[]
  public meta!: ApiResponseMetadata
}

export interface Pagination {
  skip: number
  perPage: number
  page: number
}

export function paginate<Entity>(
  results: Entity[],
  total: number,
  page: number
): Paginated<Entity> {
  const paginated: Paginated<Entity> = new Paginated()
  const perPage = config.get<number>('pagination.results')
  page = +page

  paginated.data = results
  paginated.meta = {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  }

  return paginated
}
