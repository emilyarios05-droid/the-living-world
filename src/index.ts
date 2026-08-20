import { DiagnosticsRegistry } from './diagnostics/registry.js';
import { DomainEventBus } from './core/event-bus.js';
import { advanceClock } from './core/clock.js';
import { appendEvent, createWorld } from './core/world-state.js';
import type { DomainEvent, WorldState } from './core/types.js';

export interface LivingWorldKernel {
  state: WorldState;
  readonly events: DomainEventBus;
  readonly diagnostics: DiagnosticsRegistry;
}

export function createKernel(ownerAccountId: string, nowMs = Date.now()): LivingWorldKernel {
  const state = createWorld(ownerAccountId, nowMs);
  const events = new DomainEventBus();
  const diagnostics = new DiagnosticsRegistry();

  diagnostics.register({
    id: 'simulation.clock',
    version: '1.0.0',
    owner: 'SimulationClock',
    dependencies: [],
    invariants: ['world time never moves backwards', 'clock has one authoritative owner'],
    healthCheck: () => 'healthy',
  });

  diagnostics.register({
    id: 'world.state',
    version: '1.0.0',
    owner: 'CanonicalWorldState',
    dependencies: ['simulation.clock'],
    invariants: ['every state belongs to exactly one World ID'],
    healthCheck: () => 'healthy',
  });

  const created: DomainEvent = {
    type: 'WORLD_CREATED',
    worldId: state.metadata.id,
    at: state.metadata.createdAt,
  };
  events.publish(created, state.metadata.id);

  return { state: appendEvent(state, created), events, diagnostics };
}

export function tick(kernel: LivingWorldKernel, nowMs = Date.now()): LivingWorldKernel {
  const result = advanceClock(kernel.state.clock, nowMs);
  if (result.elapsedRealMs === 0) return kernel;

  const event: DomainEvent = {
    type: 'TIME_ADVANCED',
    worldId: kernel.state.metadata.id,
    fromWorldTimeMs: kernel.state.clock.worldTimeMs,
    toWorldTimeMs: result.clock.worldTimeMs,
    elapsedRealMs: result.elapsedRealMs,
    at: result.clock.lastAdvancedAtReal,
  };

  kernel.events.publish(event, kernel.state.metadata.id);
  return {
    ...kernel,
    state: appendEvent({ ...kernel.state, clock: result.clock }, event),
  };
}
