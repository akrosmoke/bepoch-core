import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EpochsModule } from './epochs/epochs.module';
import { ModelsModule } from './models/models.module';
import { ChainModule } from './chain/chain.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EpochsModule, ModelsModule, ChainModule],
})
export class AppModule {}
