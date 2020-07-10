import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { Print, User } from '../database/entities'
import { CreatePrint } from '../model'
import { PrintsService } from '../services'
import { ApiController } from '../util/api-controller'
import { LocalAuthGuard } from '../util/auth'
import { AuthUser } from '../util/decorators'
import { Paginated } from '../util/misc'

@ApiTags('Prints')
@Controller('prints')
export class PrintsController extends ApiController<Print> {
  @Inject(PrintsService)
  protected readonly service!: PrintsService

  @UseGuards(LocalAuthGuard)
  @Get()
  public getFeed(@Query('page') page: number, @AuthUser() user: User): Promise<Paginated<Print>> {
    return this.service.getFeed(user.id, page)
  }

  @Get(':id')
  public retrieve(@Param('id') id: number): Promise<Print> {
    return this.service.retrieve(id, undefined, ['creator'])
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CreatePrint })
  @Post()
  public create(@Body() body: CreatePrint, @AuthUser() user: User): Promise<Print> {
    return this.service.create(body, user)
  }

  @UseGuards(LocalAuthGuard)
  @Get(':id/likers')
  public getLikers(
    @Param('id') id: number,
    @Query('page') page: number,
    @AuthUser() user: User
  ): Promise<User[]> {
    return this.service.getLikers(id, user.id, false, page)
  }

  @UseGuards(LocalAuthGuard)
  @Get(':id/likers/following')
  public getLikersFollowing(@Param('id') id: number, @AuthUser() user: User): Promise<User[]> {
    return this.service.getLikers(id, user.id, true)
  }

  @UseGuards(LocalAuthGuard)
  @Post(':id/likers')
  public like(@Param('id') id: number, @AuthUser() user: User): Promise<Print> {
    return this.service.like(id, user.id)
  }

  @UseGuards(LocalAuthGuard)
  @Delete(':id/likers')
  public unlike(@Param('id') id: number, @AuthUser() user: User): Promise<Print> {
    return this.service.unlike(id, user.id)
  }
}
