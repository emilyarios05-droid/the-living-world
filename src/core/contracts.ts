import type { WorldId } from './types.js';

export type SystemOwner =
  | 'AccountAuth'
  | 'WorldIdentity'
  | 'CanonicalWorldState'
  | 'SimulationClock'
  | 'DomainEventBus'
  | 'WorldRules'
  | 'NPCSimulation'
  | 'Relationships'
  | 'Memory'
  | 'Economy'
  | 'HealthLife'
  | 'CalendarEvents'
  | 'TravelLocations'
  | 'ObjectsInventory'
  | 'Causality'
  | 'Generation'
  | 'AIOrchestrator'
  | 'Narrative'
  | 'Persistence'
  | 'Diagnostics';

export interface DomainCommandBase {
  readonly worldId: WorldId;
  readonly requestedAtReal: string;
  readonly requestedBy: string;
}

export type DomainCommand =
  | (DomainCommandBase & { readonly type: 'ADVANCE_TIME'; readonly nowRealMs: number })
  | (DomainCommandBase & { readonly type: 'DELETE_WORLD' })
  | (DomainCommandBase & { readonly type: 'SAVE_WORLD'; readonly reason: string })
  | (DomainCommandBase & { readonly type: 'ATTEMPT_PLAYER_ACTION'; readonly input: string });

export interface SystemContract {
  readonly owner: SystemOwner;
  readonly id: string;
  readonly version: string;
  readonly dependencies: readonly SystemOwner[];
}
