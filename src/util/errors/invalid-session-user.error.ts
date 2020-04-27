import { HttpStatus } from '@nestjs/common'

export class InvalidSessionUser extends Error {
  constructor(public readonly status: number = HttpStatus.CONFLICT) {
    super()
  }
}
