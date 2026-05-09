import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EpochsModule } from './epochs/epochs.module';
import { ModelsModule } from './models/models.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EpochsModule, ModelsModule],
})
export class AppModule {}
