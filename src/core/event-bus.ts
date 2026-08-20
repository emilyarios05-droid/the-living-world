import type { DomainEvent, WorldId } from './types.js';

type Handler = (event: DomainEvent) => void;

export class DomainEventBus {
  private readonly handlers = new Map<DomainEvent['type'], Set<Handler>>();

  subscribe(type: DomainEvent['type'], handler: Handler): () => void {
    const handlers = this.handlers.get(type) ?? new Set<Handler>();
    handlers.add(handler);
    this.handlers.set(type, handlers);
    return () => handlers.delete(handler);
  }

  publish(event: DomainEvent, worldId: WorldId): void {
    if (event.worldId !== worldId) throw new Error('EVENT_WORLD_BOUNDARY_VIOLATION');
    for (const handler of this.handlers.get(event.type) ?? []) handler(event);
  }
}
