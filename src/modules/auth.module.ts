import { Global, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from '../controllers'
import { LoginsRepository, UsersRepository } from '../database/repositories'
import { AuthService, UsersService } from '../services'
import { LocalAuthGuard, LocalSerializer, LocalStrategy, LoginGuard } from '../util/auth'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LoginsRepository, UsersRepository]), PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,
    LocalSerializer,
    LocalAuthGuard,
    LoginGuard,
  ],
  exports: [TypeOrmModule, AuthService],
})
export class AuthModule {}
