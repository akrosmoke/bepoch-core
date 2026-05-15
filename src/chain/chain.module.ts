import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { EpochsModule } from '../epochs/epochs.module';

@Module({
  imports: [EpochsModule],
  controllers: [ChainController],
  providers: [ChainService],
})
export class ChainModule {}
