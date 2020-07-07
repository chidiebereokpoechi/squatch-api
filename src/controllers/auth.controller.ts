import { Controller, Delete, Get, Inject, Post, Req, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { User } from '../database/entities'
import { AuthService } from '../services'
import { LocalAuthGuard, LoginGuard } from '../util/auth'
import { AuthUser, Public } from '../util/decorators'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  protected readonly service!: AuthService

  @Public()
  @UseGuards(LoginGuard)
  @UseGuards(LocalAuthGuard)
  @Post()
  public async login(@AuthUser() user: User) {
    return user
  }

  @UseGuards(LocalAuthGuard)
  @Get()
  public async getUser(@AuthUser() user: User) {
    return user
  }

  @UseGuards(LocalAuthGuard)
  @Delete()
  public async logout(@Req() request: Request) {
    return this.service.logout(request)
  }
}
