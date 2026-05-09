import { Injectable } from '@nestjs/common';
import { EpochsService } from '../epochs/epochs.service';

export interface ModelSummary {
  id: string;
  name: string;
  owner: string;
  domain: string;
  epochCount: number;
  latestVersion: string | null;
  latestStatus: string | null;
}

const REGISTRY: Omit<ModelSummary, 'epochCount' | 'latestVersion' | 'latestStatus'>[] = [
  {
    id: 'mdl_vision_router',
    name: 'Vision Router',
    owner: 'visionops@bepoch',
    domain: 'computer-vision',
  },
  {
    id: 'mdl_credit_scorer',
    name: 'Credit Scorer EU',
    owner: 'risk@bepoch',
    domain: 'financial-risk',
  },
  {
    id: 'mdl_llm_router',
    name: 'LLM Router',
    owner: 'platform@bepoch',
    domain: 'language',
  },
];

@Injectable()
export class ModelsService {
  constructor(private readonly epochs: EpochsService) {}

  list(): ModelSummary[] {
    return REGISTRY.map((m) => {
      const list = this.epochs.findByModel(m.id);
      const latest = list[0] ?? null;
      return {
        ...m,
        epochCount: list.length,
        latestVersion: latest?.version ?? null,
        latestStatus: latest?.status ?? null,
      };
    });
  }
}
