import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { EpochsModule } from '../epochs/epochs.module';

@Module({
  imports: [EpochsModule],
  controllers: [ModelsController],
  providers: [ModelsService],
})
export class ModelsModule {}
