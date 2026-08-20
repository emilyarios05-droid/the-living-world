import type { DomainEvent, WorldId, WorldState } from '../core/types.js';
import type { WorldRepository, WorldSnapshot } from './contracts.js';

const prefix = 'the_living_world:v1:world:';

export class BrowserLocalWorldRepository implements WorldRepository {
  private key(worldId: WorldId): string {
    return `${prefix}${worldId}`;
  }

  async create(state: WorldState): Promise<void> {
    this.write(state.metadata.id, {
      latest: state,
      events: [],
      snapshotVersion: 0,
    });
  }

  async load(worldId: WorldId): Promise<WorldState | null> {
    const record = this.read(worldId);
    return record?.latest ?? null;
  }

  async saveSnapshot(snapshot: WorldSnapshot): Promise<void> {
    const current = this.read(snapshot.worldId);
    this.write(snapshot.worldId, {
      latest: snapshot.state,
      events: current?.events ?? [],
      snapshotVersion: snapshot.snapshotVersion,
    });
  }

  async appendEvent(event: DomainEvent): Promise<void> {
    const current = this.read(event.worldId);
    if (!current) throw new Error('LOCAL_WORLD_NOT_FOUND');
    this.write(event.worldId, {
      ...current,
      events: [...current.events, event],
      latest: { ...current.latest, eventSequence: current.latest.eventSequence + 1 },
    });
  }

  async delete(worldId: WorldId): Promise<void> {
    window.localStorage.removeItem(this.key(worldId));
  }

  private read(worldId: WorldId): LocalRecord | null {
    const raw = window.localStorage.getItem(this.key(worldId));
    return raw ? JSON.parse(raw) as LocalRecord : null;
  }

  private write(worldId: WorldId, value: LocalRecord): void {
    window.localStorage.setItem(this.key(worldId), JSON.stringify(value));
  }
}

interface LocalRecord {
  readonly latest: WorldState;
  readonly events: readonly DomainEvent[];
  readonly snapshotVersion: number;
}
