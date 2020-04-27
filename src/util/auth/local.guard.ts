import {
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  @Inject(Reflector)
  protected readonly reflector!: Reflector

  public canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())
    const isAuthenticated = context
      .switchToHttp()
      .getRequest()
      .isAuthenticated()

    if (isPublic && isAuthenticated) {
      throw new ForbiddenException('Log out to access this resource')
    }

    if (!isPublic && !isAuthenticated) {
      throw new UnauthorizedException('Log in to access this resource')
    }

    return true
  }
}
