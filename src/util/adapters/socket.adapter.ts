import { IoAdapter } from '@nestjs/platform-socket.io'
import config from 'config'
import connectRedis from 'connect-redis'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import redis from 'redis'
import { authorizeSocket } from '../misc'

export class RedisIoAdapter extends IoAdapter {
  public createIOServer(port: number, options?: any): any {
    const RedisStore = connectRedis(session)
    const client = redis.createClient(config.get<redis.ClientOpts>('redis'))

    const server = super.createIOServer(port, options)
    server.use(
      authorizeSocket({
        cookieParser,
        secret: config.get<string>('app.secret'),
        passport,
        store: new RedisStore({ client }),
      })
    )

    return server
  }
}
