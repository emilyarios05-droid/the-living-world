export type WorldId = string & { readonly __brand: 'WorldId' };
export type EntityId = string & { readonly __brand: 'EntityId' };
export type IsoTimestamp = string & { readonly __brand: 'IsoTimestamp' };

export interface WorldClock {
  readonly worldId: WorldId;
  readonly startedAtReal: IsoTimestamp;
  readonly lastAdvancedAtReal: IsoTimestamp;
  readonly worldTimeMs: number;
  readonly paused: boolean;
}

export interface WorldMetadata {
  readonly id: WorldId;
  readonly ownerAccountId: string;
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
  readonly status: 'active' | 'dead' | 'deleted';
}

export interface WorldState {
  readonly metadata: WorldMetadata;
  readonly clock: WorldClock;
  readonly rulesVersion: number;
  readonly entityIds: readonly EntityId[];
  readonly eventSequence: number;
}

export type DomainEvent =
  | {
      readonly type: 'WORLD_CREATED';
      readonly worldId: WorldId;
      readonly at: IsoTimestamp;
    }
  | {
      readonly type: 'TIME_ADVANCED';
      readonly worldId: WorldId;
      readonly fromWorldTimeMs: number;
      readonly toWorldTimeMs: number;
      readonly elapsedRealMs: number;
      readonly at: IsoTimestamp;
    }
  | {
      readonly type: 'WORLD_DELETED';
      readonly worldId: WorldId;
      readonly at: IsoTimestamp;
    };
