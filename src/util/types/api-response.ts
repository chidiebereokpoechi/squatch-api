import { BaseEntity } from 'typeorm'
import { Paginated } from '../misc'

export interface ApiResponseMetadata {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type AcceptableReturn<T extends BaseEntity = any> = boolean | T | Paginated<T>

export interface ApiResponse {
  data?: AcceptableReturn
  meta?: ApiResponseMetadata
  ok: boolean
  status: number
  path?: string
  message?: string
  method?: string
}
