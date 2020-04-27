import { ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from '../../services'

@Injectable()
export class LoginGuard extends AuthGuard('local') {
  @Inject(AuthService)
  protected readonly authService!: AuthService

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean
    const request = context.switchToHttp().getRequest()
    await super.logIn(request)
    return result
  }
}
