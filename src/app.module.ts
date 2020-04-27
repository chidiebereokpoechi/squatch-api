import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import config from 'config'
import { AuthModule, PrintsModule, UsersModule } from './modules'
import { ExceptionsFilter } from './util/filters'
import { TransformInterceptor } from './util/interceptors'

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...config.get<TypeOrmModuleOptions>('database') }),
    PassportModule.register({
      defaultStrategy: 'local',
      session: true,
    }),
    AuthModule,
    PrintsModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: ExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
