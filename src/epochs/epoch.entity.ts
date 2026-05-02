export type EpochStatus = 'draft' | 'training' | 'evaluating' | 'signed' | 'anchored';

export interface EvalMetric {
  name: string;
  value: number;
  unit?: string;
}

export interface Epoch {
  id: string;
  modelId: string;
  version: string;
  parentEpochId: string | null;
  status: EpochStatus;

  datasetVersion: string;
  weightsHash: string;
  configHash: string;

  metrics: EvalMetric[];
  approver: string | null;
  signature: string | null;

  txHash: string | null;
  blockNumber: number | null;
  network: 'base' | 'base-sepolia';

  createdAt: string;
  anchoredAt: string | null;
}
