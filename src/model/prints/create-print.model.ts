import { ApiProperty } from '@nestjs/swagger'
import { MaxLength, MinLength } from 'class-validator'

const PRINT_MIN_LENGTH = 2
const PRINT_MAX_LENGTH = 140

export class CreatePrint {
  @ApiProperty({
    type: String,
    default: 'content',
    description: 'Print content',
  })
  @MinLength(PRINT_MIN_LENGTH, {
    message: `Print content must be at least ${PRINT_MIN_LENGTH} character(s) long `,
  })
  @MaxLength(PRINT_MAX_LENGTH, {
    message: `Print content must be at most ${PRINT_MAX_LENGTH} character(s) long `,
  })
  public content!: string
}
