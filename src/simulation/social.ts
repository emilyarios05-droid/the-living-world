import type { EntityId, WorldId } from '../core/types.js';
import type { GeneratedWorld } from '../world/generation.js';

export type RelationshipStatus = 'stranger' | 'acquaintance' | 'friend' | 'family' | 'romantic' | 'rival' | 'enemy';
export type KnowledgeSource = 'direct-observation' | 'public-event' | 'trusted-person' | 'rumor';

export interface SocialRelationship {
  readonly observerNpcId: EntityId;
  readonly targetNpcId: EntityId;
  readonly affinity: number;
  readonly trust: number;
  readonly status: RelationshipStatus;
  readonly lastInteractionWorldTimeMs: number;
}

export interface KnownFact {
  readonly id: string;
  readonly worldId: WorldId;
  readonly observerNpcId: EntityId;
  readonly subjectEntityId: EntityId;
  readonly summary: string;
  readonly source: KnowledgeSource;
  readonly confidence: number;
  readonly learnedAtWorldTimeMs: number;
}

export interface SocialSimulationState {
  readonly relationships: readonly SocialRelationship[];
  readonly knownFacts: readonly KnownFact[];
}

export function initializeSocialState(worldId: WorldId, generated: GeneratedWorld): SocialSimulationState {
  const relationships: SocialRelationship[] = generated.npcs.flatMap((npc) => [
    ...npc.familyNpcIds.map((targetNpcId) => ({ observerNpcId: npc.id, targetNpcId, affinity: 70, trust: 80, status: 'family' as const, lastInteractionWorldTimeMs: 0 })),
    ...npc.friendNpcIds.map((targetNpcId) => ({ observerNpcId: npc.id, targetNpcId, affinity: 55, trust: 55, status: 'friend' as const, lastInteractionWorldTimeMs: 0 })),
    ...npc.enemyNpcIds.map((targetNpcId) => ({ observerNpcId: npc.id, targetNpcId, affinity: 15, trust: 5, status: 'enemy' as const, lastInteractionWorldTimeMs: 0 })),
  ]);
  return { relationships, knownFacts: [] };
}

export function recordKnowledge(state: SocialSimulationState, fact: Omit<KnownFact, 'id'>): SocialSimulationState {
  if (fact.source === 'direct-observation' && fact.observerNpcId === fact.subjectEntityId) throw new Error('NPC_CANNOT_OBSERVE_SELF_AS_EXTERNAL_FACT');
  const existing = state.knownFacts.find((known) => known.observerNpcId === fact.observerNpcId && known.subjectEntityId === fact.subjectEntityId && known.summary === fact.summary);
  if (existing) return state;
  const id = `${fact.worldId}:${fact.observerNpcId}:${fact.subjectEntityId}:${state.knownFacts.length}`;
  return { ...state, knownFacts: [...state.knownFacts, { ...fact, id }] };
}

export function canShareFact(fact: KnownFact, targetNpcId: EntityId, relationship?: SocialRelationship): boolean {
  if (fact.observerNpcId === targetNpcId) return true;
  if (fact.source === 'direct-observation' || fact.source === 'public-event') return true;
  if (fact.source === 'trusted-person') return Boolean(relationship && relationship.targetNpcId === targetNpcId && relationship.trust >= 65);
  return Boolean(relationship && relationship.targetNpcId === targetNpcId && relationship.trust >= 30);
}
