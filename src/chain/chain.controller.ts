import { Controller, Get, Param } from '@nestjs/common';
import { ChainService } from './chain.service';

@Controller('chain')
export class ChainController {
  constructor(private readonly chain: ChainService) {}

  @Get('verify/:epochId')
  verify(@Param('epochId') epochId: string) {
    return this.chain.verify(epochId);
  }

  @Get('lineage/:epochId')
  lineage(@Param('epochId') epochId: string) {
    return this.chain.lineage(epochId);
  }
}
