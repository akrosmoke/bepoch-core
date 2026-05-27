<div align="center">

# $BEPOCH · core

**On-chain verifiable lineage for machine-learning models.**

Git-style versioning, structured tracing and cryptographic provenance for the
full model lifecycle — from raw data to production deploy. Every model release
is an **epoch**, anchored on **Base**.

[![NestJS](https://img.shields.io/badge/built%20with-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Base](https://img.shields.io/badge/anchored%20on-Base-0052FF)](https://base.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-7ED7E0)](./LICENSE)

</div>

---

## Why

ML teams ship models the way teams shipped software before CI: by hand, with
tribal knowledge, and no durable record of *what* was released, *from which
data*, *who approved it*, or *whether it still matches what's in production*.

When a regulator (EU AI Act), an enterprise buyer, or your own incident review
asks **"prove this model is what you say it is"** — most teams can't.

`bepoch-core` is the service that makes that answer trivial. It wraps the model
lifecycle in a structured, content-addressed record and anchors the proof
on-chain, so the lineage is **verifiable by anyone, tamper-evident, and
vendor-neutral**.

## The epoch model

Every model release is an **epoch** — an immutable snapshot that pins:

| Field            | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| `weightsHash`    | content hash of the model weights                           |
| `datasetVersion` | pinned, content-addressed dataset (`ds:imagenet-mini@4f1a`) |
| `configHash`     | hash of the training config / graph                         |
| `metrics`        | eval results (accuracy, fairness, EU AI Act gates, …)       |
| `approver`       | wallet that signed off on the release                       |
| `signature`      | signature over `weights ‖ config ‖ dataset`                 |
| `parentEpochId`  | the epoch this one descends from → lineage                  |
| `txHash`         | the Base transaction that anchored the proof                |

An epoch moves through a deterministic lifecycle:

```
draft → evaluating → signed → anchored
                       │          │
              approver wallet  Base L2 tx
              signs the digest  records the proof
```

Once **anchored**, the record is the canonical pointer. Anyone can re-hash the
artefact and compare against the on-chain digest — no access to the weights
required.

## Architecture

```
                        ┌───────────────────────────────┐
   HTTP / REST          │            bepoch-core         │
 ───────────────▶       │            (NestJS)            │
                        │                                │
                        │  EpochsModule   ── versioned   │
                        │                    snapshots   │
                        │  ModelsModule   ── registry +  │
                        │                    latest epoch│
                        │  ChainModule    ── verify /    │
                        │                    lineage     │
                        └───────────────┬───────────────┘
                                        │ digests + signatures
                                        ▼
                                 ┌──────────────┐
                                 │   Base L2     │  immutable proof
                                 └──────────────┘
```

The reference implementation ships with an in-memory store seeded with a
realistic lineage (`genesis → retrain → fairness pass`) so the API is
explorable out of the box. The storage layer is an interface — swap in
Postgres/Prisma without touching the controllers.

## API

Base prefix: `/api`

### Epochs

| Method | Route                 | Description                       |
| ------ | --------------------- | --------------------------------- |
| `GET`  | `/epochs`             | list all epochs (newest first)    |
| `GET`  | `/epochs?modelId=…`   | list epochs for one model         |
| `GET`  | `/epochs/:id`         | fetch a single epoch              |
| `POST` | `/epochs`             | create a draft epoch              |
| `POST` | `/epochs/:id/sign`    | approver signs → `signed`         |
| `POST` | `/epochs/:id/anchor`  | anchor a signed epoch on Base     |

### Models

| Method | Route      | Description                              |
| ------ | ---------- | ---------------------------------------- |
| `GET`  | `/models`  | registered models + their latest epoch   |

### Chain

| Method | Route                    | Description                                  |
| ------ | ------------------------ | -------------------------------------------- |
| `GET`  | `/chain/verify/:epochId` | recompute digest, check against on-chain     |
| `GET`  | `/chain/lineage/:epochId`| walk the `parentEpochId` chain to genesis    |

### Health

| Method | Route      | Description     |
| ------ | ---------- | --------------- |
| `GET`  | `/health`  | liveness probe  |

<details>
<summary>Example — verify an epoch</summary>

```bash
curl -s http://localhost:4000/api/chain/verify/ep_01HZX9LM8N0BCAR2RTKE
```

```json
{
  "ok": true,
  "epochId": "ep_01HZX9LM8N0BCAR2RTKE",
  "checks": [
    { "name": "weights_hash_present", "passed": true },
    { "name": "dataset_pinned",       "passed": true },
    { "name": "approver_signed",      "passed": true },
    { "name": "anchored_on_base",     "passed": true },
    { "name": "digest_matches",       "passed": true }
  ],
  "recomputedDigest": "0x6f0851b003…",
  "onChainDigest":   "0x5b3f2ce9f7…",
  "network": "base",
  "blockNumber": 19217902
}
```

</details>

## Quickstart

```bash
# 1. install
npm install

# 2. configure
cp .env.example .env        # fill in RPC + signer when you wire up anchoring

# 3. run
npm run start:dev           # http://localhost:4000/api

# 4. try it
curl http://localhost:4000/api/health
curl http://localhost:4000/api/epochs
```

Production:

```bash
npm run build
npm run start:prod
```

## Configuration

All config is read from the environment (see [`.env.example`](./.env.example)).
Secrets — RPC keys and the anchor signer private key — are **never** committed;
they are injected at runtime. The repo ships only `.env.example`.

| Var                         | Default   | Notes                              |
| --------------------------- | --------- | ---------------------------------- |
| `PORT`                      | `4000`    | HTTP port                          |
| `HOST`                      | `0.0.0.0` | bind address                       |
| `BASE_RPC_URL`              | —         | Base mainnet RPC                   |
| `EPOCH_REGISTRY_ADDRESS`    | —         | anchor contract on Base            |
| `ANCHOR_SIGNER_PRIVATE_KEY` | —         | server signer — **keep secret**    |

## License

MIT — see [LICENSE](./LICENSE).

<div align="center">
<sub>Every model release is a new epoch. Every epoch is a proof.</sub>
</div>
