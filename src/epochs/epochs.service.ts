import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { Epoch } from './epoch.entity';
import { EPOCH_SEED } from './epochs.seed';
import { CreateEpochDto } from './dto/create-epoch.dto';

@Injectable()
export class EpochsService {
  private readonly store: Map<string, Epoch> = new Map(
    EPOCH_SEED.map((e) => [e.id, e]),
  );

  findAll(): Epoch[] {
    return [...this.store.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findByModel(modelId: string): Epoch[] {
    return this.findAll().filter((e) => e.modelId === modelId);
  }

  findOne(id: string): Epoch {
    const epoch = this.store.get(id);
    if (!epoch) throw new NotFoundException(`Epoch ${id} not found`);
    return epoch;
  }

  create(dto: CreateEpochDto): Epoch {
    const id = `ep_${randomBytes(10).toString('hex').toUpperCase()}`;
    const epoch: Epoch = {
      id,
      modelId: dto.modelId,
      version: dto.version,
      parentEpochId: dto.parentEpochId ?? null,
      status: 'draft',
      datasetVersion: dto.datasetVersion,
      weightsHash: dto.weightsHash,
      configHash: dto.configHash,
      metrics: dto.metrics,
      approver: null,
      signature: null,
      txHash: null,
      blockNumber: null,
      network: dto.network ?? 'base-sepolia',
      createdAt: new Date().toISOString(),
      anchoredAt: null,
    };
    this.store.set(id, epoch);
    return epoch;
  }

  sign(id: string, approver: string): Epoch {
    const epoch = this.findOne(id);
    const payload = `${epoch.id}|${epoch.weightsHash}|${epoch.configHash}|${epoch.datasetVersion}`;
    const signature =
      '0xsig_' + createHash('sha256').update(payload + approver).digest('hex').slice(0, 56);
    const next: Epoch = { ...epoch, approver, signature, status: 'signed' };
    this.store.set(id, next);
    return next;
  }

  anchor(id: string): Epoch {
    const epoch = this.findOne(id);
    if (epoch.status !== 'signed' || !epoch.signature) {
      throw new NotFoundException(`Epoch ${id} is not signed yet`);
    }
    const txHash =
      '0x' + createHash('sha256').update(epoch.signature + Date.now()).digest('hex');
    const next: Epoch = {
      ...epoch,
      status: 'anchored',
      txHash,
      blockNumber: 19_200_000 + Math.floor(Math.random() * 100_000),
      anchoredAt: new Date().toISOString(),
    };
    this.store.set(id, next);
    return next;
  }
}
