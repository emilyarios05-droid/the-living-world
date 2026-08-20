import type { DomainEvent, WorldId, WorldState } from '../core/types.js';
import type { SaveManager, WorldRepository, WorldSnapshot } from './contracts.js';

export class UnifiedSaveManager implements SaveManager {
  constructor(
    public readonly local: WorldRepository,
    public readonly cloud: WorldRepository,
  ) {}

  async save(world: WorldState, reason: string): Promise<void> {
    const snapshot: WorldSnapshot = {
      worldId: world.metadata.id,
      snapshotVersion: world.eventSequence,
      state: world,
      createdAt: new Date().toISOString(),
    };
    await Promise.all([this.local.saveSnapshot(snapshot), this.cloud.saveSnapshot(snapshot)]);
    void reason;
  }

  async appendEvent(event: DomainEvent, sequence: number): Promise<void> {
    await Promise.all([this.local.appendEvent(event, sequence), this.cloud.appendEvent(event, sequence)]);
  }

  async load(worldId: WorldId, source: 'local' | 'cloud'): Promise<WorldState | null> {
    return (source === 'local' ? this.local : this.cloud).load(worldId);
  }

  async deleteWorld(worldId: WorldId): Promise<void> {
    await Promise.all([this.local.delete(worldId), this.cloud.delete(worldId)]);
  }
}
