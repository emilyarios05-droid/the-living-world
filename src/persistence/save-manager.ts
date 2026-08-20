import type { WorldState } from '../core/types.js';
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

    await Promise.all([
      this.saveTo(this.local, world, snapshot, reason),
      this.saveTo(this.cloud, world, snapshot, reason),
    ]);
  }

  async load(worldId: WorldState['metadata']['id'], source: 'local' | 'cloud'): Promise<WorldState | null> {
    return (source === 'local' ? this.local : this.cloud).load(worldId);
  }

  async deleteWorld(worldId: WorldState['metadata']['id']): Promise<void> {
    await Promise.all([
      this.local.delete(worldId),
      this.cloud.delete(worldId),
    ]);
  }

  private async saveTo(repository: WorldRepository, world: WorldState, snapshot: WorldSnapshot, reason: string): Promise<void> {
    await repository.create(world).catch((error) => {
      if (!(error instanceof Error) || !error.message.includes('duplicate')) throw error;
    });
    await repository.saveSnapshot(snapshot);
    await repository.appendEvent({
      type: 'TIME_ADVANCED',
      worldId: world.metadata.id,
      fromWorldTimeMs: world.clock.worldTimeMs,
      toWorldTimeMs: world.clock.worldTimeMs,
      elapsedRealMs: 0,
      at: snapshot.createdAt as WorldState['metadata']['createdAt'],
    }, world.eventSequence + 1);
    void reason;
  }
}
