import { randomUUID } from 'node:crypto';
import type { WorldId } from '../core/types.js';

export type RuleCategory =
  | 'physics' | 'biology' | 'species' | 'magic' | 'technology' | 'geography'
  | 'government' | 'law' | 'economy' | 'culture' | 'religion' | 'education'
  | 'family' | 'relationships' | 'medicine' | 'death' | 'aging' | 'transportation'
  | 'communication' | 'environment';

export type RuleStability = 'foundational' | 'evolving';

export interface WorldRuleCategoryDefinition {
  readonly id: RuleCategory;
  readonly name: string;
  readonly description: string;
  readonly example: string;
  readonly placeholder: string;
  readonly stability: RuleStability;
}

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

export const WORLD_RULE_CATEGORIES: readonly WorldRuleCategoryDefinition[] = [
  ['physics','Physics & reality','What fundamental physical rules govern this world?','Gravity works normally and time moves forward.','Example: Gravity is weaker than Earth...','foundational'],
  ['biology','Biology','What biological rules and limits apply?','People need food, water, sleep and oxygen; injuries take realistic time to heal.','Example: Elves heal faster than humans...','foundational'],
  ['species','Species & consciousness','What kinds of intelligent beings exist?','Humans and elves are fully sapient people with distinct cultures.','Example: Shapeshifters are fully sapient...','foundational'],
  ['magic','Magic','Does magic exist, and what are its limits?','Magic exists but requires energy and cannot create unlimited matter from nothing.','Example: Magic is rare and requires...','foundational'],
  ['technology','Technology','What technology exists and what are its limits?','Technology is modern-day level; faster-than-light travel does not exist.','Example: Faster-than-light travel...','foundational'],
  ['geography','Geography','What geographic structure should the generated world follow?','There are three continents, an inland sea, temperate north and tropical south.','Example: The world has...','foundational'],
  ['government','Government & society','How are communities governed?','Cities have elected councils and regional governments.','Example: The kingdom is ruled by...','evolving'],
  ['law','Laws & justice','What is legal, illegal, and how is justice handled?','Theft is illegal and courts investigate reported crimes.','Example: Magic use is regulated by...','evolving'],
  ['economy','Economy & currency','What money, markets, work and trade systems exist?','The world uses gold crowns; wages, businesses, trade, taxes and changing prices exist.','Example: The currency is...','evolving'],
  ['culture','Culture & customs','What traditions, values, holidays and social expectations exist?','Major holidays and regional customs differ by culture.','Example: People celebrate...','evolving'],
  ['religion','Religion & belief','What religions, philosophies or belief systems exist?','Belief systems vary between regions and individuals.','Example: The major faiths are...','evolving'],
  ['education','Education','How do people learn and what institutions exist?','Children attend local schools, followed by optional higher education or apprenticeships.','Example: Education works through...','evolving'],
  ['family','Family','What family structures and responsibilities are normal?','Families form naturally and children are raised by their families or communities.','Example: Families usually...','evolving'],
  ['relationships','Relationships','What social and relationship norms exist?','Relationships can begin and end naturally and are affected by behavior and circumstances.','Example: Marriage is...','evolving'],
  ['medicine','Medicine & health','How advanced is medicine and how does health work?','Common illnesses exist and treatment takes realistic time.','Example: Medicine can...','foundational'],
  ['death','Death & resurrection','What happens when people die?','Death is permanent unless the world explicitly establishes a return mechanism.','Example: Resurrection is...','foundational'],
  ['aging','Aging & lifespan','How do people age and how long do they live?','People age naturally and lifespan depends on species and world rules.','Example: Elves live...','foundational'],
  ['transportation','Transportation','How do people travel and what infrastructure exists?','Travel consumes real simulated time and uses available transportation.','Example: Long-distance travel uses...','evolving'],
  ['communication','Communication','What communication methods exist and who can access them?','Communication requires appropriate devices, accounts, access and circumstances.','Example: Long-distance communication...','evolving'],
  ['environment','Environment & climate','What environmental and climate rules shape everyday life?','Weather follows regional climate and seasonal patterns and affects travel and supplies.','Example: Winters are...','foundational'],
].map(([id,name,description,example,placeholder,stability]) => ({ id: id as RuleCategory, name, description, example, placeholder, stability: stability as RuleStability }));

export function createConstitution(worldId: WorldId): WorldConstitution {
  return { worldId, version: 1, rules: [], locked: false };
}

export function addRule(constitution: WorldConstitution, rule: WorldRule): WorldConstitution {
  if (constitution.locked && rule.stability === 'foundational') throw new Error('FOUNDATIONAL_RULES_LOCKED');
  if (rule.worldId !== constitution.worldId) throw new Error('RULE_WORLD_BOUNDARY_VIOLATION');
  if (constitution.rules.some((existing) => existing.id === rule.id)) throw new Error(`DUPLICATE_WORLD_RULE:${rule.id}`);
  return { ...constitution, version: constitution.version + 1, rules: [...constitution.rules, rule] };
}

export function upsertPlayerRule(constitution: WorldConstitution, category: RuleCategory, description: string): WorldConstitution {
  const definition = WORLD_RULE_CATEGORIES.find((item) => item.id === category);
  if (!definition || !description.trim()) return constitution;
  if (constitution.locked && definition.stability === 'foundational') throw new Error('FOUNDATIONAL_RULES_LOCKED');
  const rules = constitution.rules.filter((rule) => rule.category !== category);
  return addRule({ ...constitution, rules }, {
    id: randomUUID(), worldId: constitution.worldId, category,
    title: definition.name, description: description.trim(), stability: definition.stability,
    source: 'player', version: constitution.version + 1,
  });
}

export function lockFoundationalRules(constitution: WorldConstitution): WorldConstitution {
  return { ...constitution, locked: true, version: constitution.version + 1 };
}

export function validateConstitution(constitution: WorldConstitution): readonly string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const rule of constitution.rules) {
    if (rule.worldId !== constitution.worldId) errors.push(`Rule ${rule.id} belongs to another world.`);
    if (seen.has(rule.category)) errors.push(`Duplicate rule category: ${rule.category}`);
    seen.add(rule.category);
    if (!rule.description.trim()) errors.push(`Empty rule: ${rule.category}`);
  }
  return errors;
}
