import type { WorldId } from '../core/types.js';

export type RuleCategory =
  | 'physics'
  | 'biology'
  | 'species'
  | 'magic'
  | 'technology'
  | 'geography'
  | 'government'
  | 'law'
  | 'economy'
  | 'culture'
  | 'religion'
  | 'education'
  | 'family'
  | 'relationships'
  | 'medicine'
  | 'death'
  | 'aging'
  | 'transportation'
  | 'communication'
  | 'environment';

export type RuleStability = 'foundational' | 'evolving';

export interface WorldRule {
  readonly id: string;
  readonly worldId: WorldId;
  readonly category: RuleCategory;
  readonly title: string;
  readonly description: string;
  readonly stability: RuleStability;
  readonly source: 'player' | 'ai_proposal' | 'world_event';
  readonly version: number;
}

export interface WorldConstitution {
  readonly worldId: WorldId;
  readonly version: number;
  readonly rules: readonly WorldRule[];
  readonly locked: boolean;
}

export function createConstitution(worldId: WorldId): WorldConstitution {
  return { worldId, version: 1, rules: [], locked: false };
}

export function addRule(constitution: WorldConstitution, rule: WorldRule): WorldConstitution {
  if (constitution.locked && rule.stability === 'foundational') {
    throw new Error('FOUNDATIONAL_RULES_LOCKED');
  }
  if (rule.worldId !== constitution.worldId) throw new Error('RULE_WORLD_BOUNDARY_VIOLATION');
  if (constitution.rules.some((existing) => existing.id === rule.id)) {
    throw new Error(`DUPLICATE_WORLD_RULE:${rule.id}`);
  }
  return {
    ...constitution,
    version: constitution.version + 1,
    rules: [...constitution.rules, rule],
  };
}

export function lockFoundationalRules(constitution: WorldConstitution): WorldConstitution {
  return { ...constitution, locked: true, version: constitution.version + 1 };
}
