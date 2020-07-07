import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { User } from '../database/entities'
import { CreateUser } from '../model/users'
import { UsersService } from '../services/users.service'
import { ApiController } from '../util/ApiController'
import { LocalAuthGuard } from '../util/auth'
import { AuthUser, Public } from '../util/decorators'

@ApiTags('Users')
@Controller('users')
export class UsersController extends ApiController<User> {
  @Inject(UsersService)
  protected readonly service!: UsersService

  @Get(':id/followers')
  public getFollowers(@Param('id') id: number) {
    return this.service.getFollowers(id)
  }

  @Get(':id/following')
  public getFollowing(@Param('id') id: number) {
    return this.service.getFollowing(id)
  }

  @Get(':username')
  public retrieve(@Param('username') username: string) {
    return this.service.retrieveBy({ username })
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CreateUser })
  @Post()
  public create(@Body() body: CreateUser) {
    return this.service.create(body)
  }

  @UseGuards(LocalAuthGuard)
  @Post(':id/followers')
  public follow(@Param('id') id: number, @AuthUser() user: User) {
    return this.service.follow(user, id)
  }
}
