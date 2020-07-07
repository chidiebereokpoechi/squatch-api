import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MinLength } from 'class-validator'

const USERNAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]+$/
const USERNAME_MIN_LENGTH = 3
const NAME_MIN_LENGTH = 2
const PASSWORD_MIN_LENGTH = 8

export class CreateUser {
  @ApiProperty({
    type: String,
    default: 'username',
    description: `User's username`,
  })
  @MinLength(USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${USERNAME_MIN_LENGTH} character(s) long `,
  })
  @Matches(USERNAME_PATTERN, { message: 'Username is invalid' })
  public username!: string

  @ApiProperty({
    type: String,
    default: 'name',
    description: `User's display name`,
  })
  @MinLength(NAME_MIN_LENGTH, {
    message: `Name must be at least ${NAME_MIN_LENGTH} character(s) long `,
  })
  @IsString({ message: 'Name is invalid' })
  public name!: string

  @ApiProperty({
    type: String,
    default: 'email',
    description: `User's email address`,
  })
  @IsEmail(undefined, { message: 'Email is invalid' })
  public email!: string

  @ApiProperty({
    type: String,
    default: 'password',
    description: `User's password`,
  })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} character(s) long `,
  })
  @IsString({ message: 'Password is invalid' })
  public password!: string
}
