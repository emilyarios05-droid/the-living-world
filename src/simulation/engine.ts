import { appendEvent } from '../core/world-state.js';
import { advanceClock } from '../core/clock.js';
import type { DomainCommand } from '../core/contracts.js';
import type { DomainEvent, WorldState } from '../core/types.js';

export interface SimulationResult {
  readonly state: WorldState;
  readonly events: readonly DomainEvent[];
}

export function resolveCommand(state: WorldState, command: DomainCommand): SimulationResult {
  if (command.worldId !== state.metadata.id) throw new Error('COMMAND_WORLD_BOUNDARY_VIOLATION');
  if (state.metadata.status === 'deleted') throw new Error('WORLD_ALREADY_DELETED');

  switch (command.type) {
    case 'ADVANCE_TIME': {
      const result = advanceClock(state.clock, command.nowRealMs);
      if (result.elapsedRealMs === 0) return { state, events: [] };
      const event: DomainEvent = {
        type: 'TIME_ADVANCED',
        worldId: state.metadata.id,
        fromWorldTimeMs: state.clock.worldTimeMs,
        toWorldTimeMs: result.clock.worldTimeMs,
        elapsedRealMs: result.elapsedRealMs,
        at: result.clock.lastAdvancedAtReal,
      };
      return {
        state: appendEvent({ ...state, clock: result.clock }, event),
        events: [event],
      };
    }

    case 'DELETE_WORLD': {
      const event: DomainEvent = {
        type: 'WORLD_DELETED',
        worldId: state.metadata.id,
        at: new Date().toISOString() as DomainEvent['at'],
      };
      return {
        state: appendEvent({ ...state, metadata: { ...state.metadata, status: 'deleted' } }, event),
        events: [event],
      };
    }

    case 'SAVE_WORLD':
    case 'ATTEMPT_PLAYER_ACTION':
      // These commands are intentionally not resolved here yet. Their owning systems
      // will be introduced behind explicit contracts rather than allowing this engine
      // to become a catch-all owner.
      throw new Error(`UNIMPLEMENTED_COMMAND_OWNER:${command.type}`);
  }
}
