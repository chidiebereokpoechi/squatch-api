import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../../services'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(AuthService)
  protected readonly authService!: AuthService

  constructor() {
    super({
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
    })
  }

  public async validate(usernameOrEmail: string, password: string, done: CallableFunction) {
    const user = await this.authService.validateUser(usernameOrEmail, password)

    if (!user) {
      return done(new NotFoundException())
    }

    done(null, user)
  }
}
