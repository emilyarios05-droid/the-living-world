import { randomUUID } from 'node:crypto';
import { createClock } from './clock.js';
import { createConstitution } from '../world/rules.js';
import type { DomainEvent, EntityId, IsoTimestamp, WorldId, WorldState } from './types.js';

const timestamp = (): IsoTimestamp => new Date().toISOString() as IsoTimestamp;
const worldId = (): WorldId => randomUUID() as WorldId;

export function createWorld(ownerAccountId: string, nowMs = Date.now()): WorldState {
  const id = worldId();
  const now = new Date(nowMs).toISOString() as IsoTimestamp;
  return {
    metadata: { id, ownerAccountId, createdAt: now, updatedAt: now, status: 'active' },
    clock: createClock(id, nowMs),
    rulesVersion: 1,
    constitution: createConstitution(id),
    entityIds: [],
    eventSequence: 0,
  };
}

export function addEntity(state: WorldState, entityId: EntityId): WorldState {
  if (state.entityIds.includes(entityId)) return state;
  return { ...state, metadata: { ...state.metadata, updatedAt: timestamp() }, entityIds: [...state.entityIds, entityId] };
}

export function appendEvent(state: WorldState, event: DomainEvent): WorldState {
  if (event.worldId !== state.metadata.id) throw new Error('WORLD_BOUNDARY_VIOLATION');
  return { ...state, metadata: { ...state.metadata, updatedAt: event.at }, eventSequence: state.eventSequence + 1 };
}

export function deleteWorld(state: WorldState): WorldState {
  return { ...state, metadata: { ...state.metadata, status: 'deleted', updatedAt: timestamp() } };
}
