import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EpochsService } from './epochs.service';
import { CreateEpochDto } from './dto/create-epoch.dto';

@Controller('epochs')
export class EpochsController {
  constructor(private readonly epochs: EpochsService) {}

  @Get()
  list(@Query('modelId') modelId?: string) {
    return modelId ? this.epochs.findByModel(modelId) : this.epochs.findAll();
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.epochs.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEpochDto) {
    return this.epochs.create(dto);
  }

  @Post(':id/sign')
  sign(@Param('id') id: string, @Body('approver') approver: string) {
    return this.epochs.sign(id, approver);
  }

  @Post(':id/anchor')
  anchor(@Param('id') id: string) {
    return this.epochs.anchor(id);
  }
}
