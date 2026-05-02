import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EpochsModule } from './epochs/epochs.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EpochsModule],
})
export class AppModule {}
