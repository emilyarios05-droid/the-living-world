import type { WorldState } from '../core/types.js';
import type { WorldConstitution } from './rules.js';

export interface PreflightIssue { readonly severity: 'error' | 'warning'; readonly code: string; readonly message: string; }
export interface PreflightReport { readonly passed: boolean; readonly issues: readonly PreflightIssue[]; }

export function validateWorld(state: WorldState, constitution?: WorldConstitution): PreflightReport {
  const issues: PreflightIssue[] = [];
  if (state.metadata.id !== state.clock.worldId) issues.push({ severity: 'error', code: 'WORLD_CLOCK_MISMATCH', message: 'World clock belongs to a different World ID.' });
  if (state.eventSequence < 1) issues.push({ severity: 'warning', code: 'WORLD_HAS_NO_HISTORY', message: 'World has not yet recorded its creation event.' });
  if (state.rulesVersion < 1) issues.push({ severity: 'error', code: 'INVALID_RULE_VERSION', message: 'World rules version must be at least 1.' });
  if (state.clock.worldTimeMs < 0) issues.push({ severity: 'error', code: 'NEGATIVE_WORLD_TIME', message: 'World time cannot be negative.' });
  if (constitution) {
    if (constitution.worldId !== state.metadata.id) issues.push({ severity: 'error', code: 'CONSTITUTION_WORLD_MISMATCH', message: 'World Constitution belongs to another world.' });
    const ids = new Set<string>();
    for (const rule of constitution.rules) { if (ids.has(rule.id)) issues.push({ severity: 'error', code: 'DUPLICATE_RULE_ID', message: `Duplicate rule: ${rule.id}` }); ids.add(rule.id); if (rule.worldId !== state.metadata.id) issues.push({ severity: 'error', code: 'RULE_WORLD_MISMATCH', message: `Rule ${rule.id} belongs to another world.` }); }
  }
  if (state.playerCharacter) {
    if (state.playerCharacter.worldId !== state.metadata.id) issues.push({ severity: 'error', code: 'PLAYER_CHARACTER_WORLD_MISMATCH', message: 'Player character belongs to another world.' });
    if (state.playerCharacter.age < 18) issues.push({ severity: 'error', code: 'PLAYER_CHARACTER_UNDERAGE', message: 'Player character must be 18 or older.' });
    if (state.playerCharacter.backstory.trim().split(/\s+/u).filter(Boolean).length > 2000) issues.push({ severity: 'error', code: 'PLAYER_BACKSTORY_TOO_LONG', message: 'Player backstory exceeds 2,000 words.' });
  }
  const generation = state.generation;
  if (!generation) {
    issues.push({ severity: 'warning', code: 'WORLD_NOT_GENERATED', message: 'World has rules but no generated geography, population, economy, or map hierarchy yet.' });
  } else {
    if (generation.status !== 'ready') issues.push({ severity: 'error', code: 'GENERATION_NOT_READY', message: 'Generated world is not marked ready.' });
    if (generation.maps.length === 0) issues.push({ severity: 'error', code: 'GENERATION_HAS_NO_MAPS', message: 'Generated world has no map hierarchy.' });
    if (generation.regions.length === 0) issues.push({ severity: 'error', code: 'GENERATION_HAS_NO_REGIONS', message: 'Generated world has no regions.' });
    if (generation.settlements.length === 0) issues.push({ severity: 'error', code: 'GENERATION_HAS_NO_SETTLEMENTS', message: 'Generated world has no settlements.' });
    if (generation.npcs.length === 0) issues.push({ severity: 'error', code: 'GENERATION_HAS_NO_NPCS', message: 'Generated world has no initial NPC population.' });
    if (generation.economy.prices.length === 0) issues.push({ severity: 'error', code: 'GENERATION_HAS_NO_ECONOMY', message: 'Generated world has no starting prices.' });
    if (generation.maps.filter((map) => map.kind === 'world').length !== 1) issues.push({ severity: 'error', code: 'WORLD_MAP_COUNT_INVALID', message: 'Generated world must have exactly one full world map.' });
    if (generation.maps.some((map) => map.fixed !== true)) issues.push({ severity: 'error', code: 'FIXED_MAP_VIOLATION', message: 'Initial maps must be fixed after world generation.' });
    if (generation.npcs.some((npc) => npc.alive !== true)) issues.push({ severity: 'error', code: 'INVALID_INITIAL_NPC', message: 'Initial generated NPCs must begin alive.' });
    if (!state.simulation) issues.push({ severity: 'error', code: 'SIMULATION_STATE_MISSING', message: 'Generated world has no living simulation state.' });
    else {
      if (state.simulation.npcStates.length !== generation.npcs.length) issues.push({ severity: 'error', code: 'NPC_STATE_COUNT_MISMATCH', message: 'NPC simulation state does not match generated population.' });
      if (state.simulation.economy.currencyName !== generation.economy.currencyName) issues.push({ severity: 'error', code: 'ECONOMY_CURRENCY_MISMATCH', message: 'Simulation economy currency differs from generated world currency.' });
      if (state.simulation.economy.priceMultiplier < 0.7 || state.simulation.economy.priceMultiplier > 1.5) issues.push({ severity: 'error', code: 'ECONOMY_PRICE_BOUNDS', message: 'Economy price multiplier is outside configured bounds.' });
      if (state.simulation.calendarEvents.some((event) => event.worldId !== state.metadata.id)) issues.push({ severity: 'error', code: 'CALENDAR_WORLD_MISMATCH', message: 'A calendar event belongs to another world.' });
    }
  }
  return { passed: issues.every((issue) => issue.severity !== 'error'), issues };
}
