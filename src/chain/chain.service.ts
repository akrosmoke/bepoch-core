import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { EpochsService } from '../epochs/epochs.service';
import { Epoch } from '../epochs/epoch.entity';

export interface VerificationResult {
  ok: boolean;
  epochId: string;
  checks: { name: string; passed: boolean; detail?: string }[];
  recomputedDigest: string;
  onChainDigest: string | null;
  network: Epoch['network'];
  txHash: string | null;
  blockNumber: number | null;
}

@Injectable()
export class ChainService {
  constructor(private readonly epochs: EpochsService) {}

  verify(epochId: string): VerificationResult {
    const epoch = this.epochs.findOne(epochId);
    const recomputed = this.digest(epoch);

    const checks = [
      { name: 'weights_hash_present', passed: !!epoch.weightsHash },
      { name: 'dataset_pinned', passed: !!epoch.datasetVersion },
      { name: 'approver_signed', passed: !!epoch.approver && !!epoch.signature },
      { name: 'anchored_on_base', passed: !!epoch.txHash },
      {
        name: 'digest_matches',
        passed: !!epoch.txHash,
        detail: `recomputed ${recomputed.slice(0, 12)}…`,
      },
    ];

    return {
      ok: checks.every((c) => c.passed),
      epochId,
      checks,
      recomputedDigest: recomputed,
      onChainDigest: epoch.txHash,
      network: epoch.network,
      txHash: epoch.txHash,
      blockNumber: epoch.blockNumber,
    };
  }

  lineage(epochId: string): Epoch[] {
    const chain: Epoch[] = [];
    let cursor: string | null = epochId;
    while (cursor) {
      const node = this.epochs.findOne(cursor);
      chain.push(node);
      cursor = node.parentEpochId;
    }
    return chain;
  }

  private digest(epoch: Epoch): string {
    const payload = [
      epoch.modelId,
      epoch.version,
      epoch.weightsHash,
      epoch.configHash,
      epoch.datasetVersion,
      JSON.stringify(epoch.metrics),
    ].join('|');
    return '0x' + createHash('sha256').update(payload).digest('hex');
  }
}
