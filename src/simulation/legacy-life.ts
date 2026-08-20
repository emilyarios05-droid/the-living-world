import type { WorldId } from '../core/types.js';

export interface OffspringCandidate {
  id: string;
  name: string;
  age: number;
  parentWorldId: WorldId;
  alive: boolean;
  relationshipToPlayer: 'child';
}

/** Hidden continuation is only exposed when an eligible adult offspring exists. */
export function eligibleOffspring(children: OffspringCandidate[]): OffspringCandidate[] {
  return children.filter((child) => child.alive && child.age >= 18);
}

export function hasHiddenLegacyContinuation(children: OffspringCandidate[]): boolean {
  return eligibleOffspring(children).length > 0;
}
