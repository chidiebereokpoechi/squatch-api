import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PrintsController } from '../controllers'
import { PrintsRepository } from '../database/repositories'
import { PrintsGateway } from '../gateways'
import { PrintsService } from '../services'

@Module({
  imports: [TypeOrmModule.forFeature([PrintsRepository])],
  controllers: [PrintsController],
  providers: [PrintsService, PrintsGateway],
  exports: [TypeOrmModule],
})
export class PrintsModule {}
