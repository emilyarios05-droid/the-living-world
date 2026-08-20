import type { DomainEvent, WorldId, WorldState } from '../core/types.js';

export interface WorldSnapshot {
  readonly worldId: WorldId;
  readonly snapshotVersion: number;
  readonly state: WorldState;
  readonly createdAt: string;
}

export interface WorldRepository {
  create(state: WorldState): Promise<void>;
  load(worldId: WorldId): Promise<WorldState | null>;
  saveSnapshot(snapshot: WorldSnapshot): Promise<void>;
  appendEvent(event: DomainEvent, sequence: number): Promise<void>;
  delete(worldId: WorldId): Promise<void>;
}

export interface SaveManager {
  readonly local: WorldRepository;
  readonly cloud: WorldRepository;

  save(world: WorldState, reason: string): Promise<void>;
  load(worldId: WorldId, source: 'local' | 'cloud'): Promise<WorldState | null>;
  deleteWorld(worldId: WorldId): Promise<void>;
}
