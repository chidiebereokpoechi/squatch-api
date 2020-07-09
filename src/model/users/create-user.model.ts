import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/
const USERNAME_MIN_LENGTH = 5
const USERNAME_MAX_LENGTH = 20

const NAME_MIN_LENGTH = 5
const NAME_MAX_LENGTH = 20

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 30

export class CreateUser {
  @ApiProperty({
    type: String,
    default: 'username',
    description: `User's username`,
  })
  @MinLength(USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${USERNAME_MIN_LENGTH} character(s) long `,
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: `Username must be at most ${USERNAME_MAX_LENGTH} character(s) long `,
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
  @MaxLength(NAME_MAX_LENGTH, {
    message: `Name must be at most ${NAME_MAX_LENGTH} character(s) long `,
  })
  @IsString({ message: 'Name is invalid' })
  public name!: string

  @ApiProperty({
    type: String,
    default: 'email',
    description: `User's email address`,
  })
  @IsEmail({}, { message: 'Email is invalid' })
  public email!: string

  @ApiProperty({
    type: String,
    default: 'password',
    description: `User's password`,
  })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} character(s) long `,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} character(s) long `,
  })
  @IsString({ message: 'Password is invalid' })
  public password!: string
}
