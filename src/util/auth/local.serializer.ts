import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { getRepository } from 'typeorm'
import { User } from '../../database/entities'
import { InvalidSessionUser } from '../errors'

@Injectable()
export class LocalSerializer extends PassportSerializer {
  public serializeUser(user: User, done: CallableFunction) {
    done(null, user.id)
  }

  public async deserializeUser(id: number, done: CallableFunction) {
    const user = await getRepository(User).findOne(id)

    if (!user) {
      return done(new InvalidSessionUser())
    }

    done(null, user)
  }
}
