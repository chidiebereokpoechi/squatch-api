import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { Print, User } from '../database/entities'
import { CreatePrint } from '../model'
import { PrintsService } from '../services'
import { ApiController } from '../util/ApiController'
import { LocalAuthGuard } from '../util/auth'
import { AuthUser } from '../util/decorators'

@ApiTags('Prints')
@Controller('prints')
export class PrintsController extends ApiController<Print> {
  @Inject(PrintsService)
  protected readonly service!: PrintsService

  @Get()
  public list(): Promise<Print[]> {
    return this.service.list(undefined, ['creator', 'likers'])
  }

  @Get(':id')
  public retrieve(@Param('id') id: number): Promise<Print> {
    return this.service.retrieve(id, undefined, ['creator', 'likers'])
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CreatePrint })
  @Post()
  public create(@Body() body: CreatePrint, @AuthUser() user: User): Promise<Print> {
    return this.service.create(body, user)
  }

  @UseGuards(LocalAuthGuard)
  @Post(':id/like')
  public like(@Param('id') id: number, @AuthUser() user: User): Promise<Print> {
    return this.service.like(id, user)
  }

  @UseGuards(LocalAuthGuard)
  @Delete(':id/like')
  public unlike(@Param('id') id: number, @AuthUser() user: User): Promise<Print> {
    return this.service.unlike(id, user)
  }
}
