import { Body, Controller, Delete, Get, Inject, Post, Req, UseGuards } from '@nestjs/common'
import { ApiAcceptedResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { User } from '../database/entities'
import { Login } from '../model'
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
  @ApiAcceptedResponse()
  @Post()
  public async login(@Body() login: Login, @AuthUser() user: User) {
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
