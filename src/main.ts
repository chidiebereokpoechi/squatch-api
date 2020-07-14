import env from 'dotenv'
env.config()

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import config from 'config'
import connectRedis from 'connect-redis'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import redis from 'redis'
import { AppModule } from './app.module'
import { RedisIoAdapter } from './util/adapters'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const RedisStore = connectRedis(session)
  const client = redis.createClient(config.get<redis.ClientOpts>('redis'))

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  )

  app.use(
    session({
      store: new RedisStore({ client }),
      secret: config.get<string>('app.secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: Boolean((process.env.COOKIE_SECURE as any) ?? false),
        httpOnly: Boolean((process.env.COOKIE_HTTP_ONLY as any) ?? false),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: (process.env.COOKIE_SAME_SITE as any) ?? undefined,
      },
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(
    cors({
      allowedHeaders: ['Content-Type', 'Accept'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      origin: process.env.APP_FRONTEND_ORIGIN,
      credentials: true,
    })
  )

  app.useWebSocketAdapter(new RedisIoAdapter(app))

  const options = new DocumentBuilder()
    .setTitle('Squatch')
    .setDescription('Microblogging platform')
    .setVersion('0.1.0')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT || config.get<number>('app.port'))
}

bootstrap()
