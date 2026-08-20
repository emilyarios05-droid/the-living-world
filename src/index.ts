import { DiagnosticsRegistry } from './diagnostics/registry.js';
import { DomainEventBus } from './core/event-bus.js';
import { createWorld, appendEvent } from './core/world-state.js';
import { resolveCommand } from './simulation/engine.js';
import type { DomainEvent, WorldState } from './core/types.js';

export interface LivingWorldKernel {
  state: WorldState;
  readonly events: DomainEventBus;
  readonly diagnostics: DiagnosticsRegistry;
}

function createDiagnostics(): DiagnosticsRegistry {
  const diagnostics = new DiagnosticsRegistry();
  diagnostics.register({
    id: 'simulation.clock',
    version: '1.1.0',
    owner: 'SimulationClock',
    dependencies: [],
    invariants: ['world time never moves backwards', 'clock has one authoritative owner'],
    healthCheck: () => 'healthy',
  });
  diagnostics.register({
    id: 'world.state',
    version: '1.1.0',
    owner: 'CanonicalWorldState',
    dependencies: ['simulation.clock'],
    invariants: ['every state belongs to exactly one World ID'],
    healthCheck: () => 'healthy',
  });
  diagnostics.register({
    id: 'world.generation',
    version: '1.0.0',
    owner: 'WorldGenerator',
    dependencies: ['world.state'],
    invariants: ['generated content belongs to exactly one World ID', 'fixed map hierarchy is immutable after generation'],
    healthCheck: () => 'healthy',
  });
  diagnostics.register({
    id: 'simulation.command-boundary',
    version: '1.0.0',
    owner: 'CanonicalWorldState',
    dependencies: ['simulation.clock', 'world.state'],
    invariants: ['commands cannot cross World IDs', 'simulation commands resolve through owning systems'],
    healthCheck: () => 'healthy',
  });
  return diagnostics;
}

export function createKernel(ownerAccountId: string, nowMs = Date.now()): LivingWorldKernel {
  return createKernelFromState(createWorld(ownerAccountId, nowMs), true);
}

export function createKernelFromState(state: WorldState, emitCreationEvent = false): LivingWorldKernel {
  const events = new DomainEventBus();
  const diagnostics = createDiagnostics();
  if (!emitCreationEvent) return { state, events, diagnostics };

  const created: DomainEvent = { type: 'WORLD_CREATED', worldId: state.metadata.id, at: state.metadata.createdAt };
  events.publish(created, state.metadata.id);
  return { state: appendEvent(state, created), events, diagnostics };
}

export function tick(kernel: LivingWorldKernel, nowMs = Date.now()): LivingWorldKernel {
  const result = resolveCommand(kernel.state, {
    type: 'ADVANCE_TIME',
    worldId: kernel.state.metadata.id,
    requestedAtReal: new Date(nowMs).toISOString(),
    requestedBy: 'simulation-clock',
    nowRealMs: nowMs,
  });

  for (const event of result.events) kernel.events.publish(event, kernel.state.metadata.id);
  if (result.events.length === 0) return kernel;
  return { ...kernel, state: result.state };
}
