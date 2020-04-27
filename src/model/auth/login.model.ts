import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class Login {
  @ApiProperty({
    type: String,
    default: 'username | email',
    description: `User's username or email address`,
  })
  @IsString({ message: 'login is invalid' })
  public usernameOrEmail!: string

  @ApiProperty({
    type: String,
    default: 'password',
    description: `User's password`,
  })
  @IsString({ message: 'Password is invalid' })
  public password!: string
}
