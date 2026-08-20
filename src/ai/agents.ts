import type { AIAgentContract } from './contracts.js';
import { WORLD_AI_AGENTS } from './orchestrator.js';

export const INITIAL_AI_AGENT_CONTRACTS: readonly AIAgentContract[] = [
  { id: WORLD_AI_AGENTS.worldRules, version: '1.0.0', allowedSystems: ['world.rules'], prohibitedAuthority: ['simulation.time', 'world.persistence', 'account.auth'], requiredContext: ['world constitution', 'world generation spec'] },
  { id: WORLD_AI_AGENTS.worldGeneration, version: '1.0.0', allowedSystems: ['world.generation', 'world.maps', 'world.population'], prohibitedAuthority: ['account.auth', 'world.persistence', 'simulation.time'], requiredContext: ['world constitution', 'generation spec'] },
  { id: WORLD_AI_AGENTS.npcDirector, version: '1.0.0', allowedSystems: ['npc.population', 'npc.schedules', 'social.network'], prohibitedAuthority: ['world.time', 'world.persistence', 'account.auth'], requiredContext: ['known world state', 'elapsed world time', 'observable events'] },
  { id: WORLD_AI_AGENTS.npcIndividual, version: '1.0.0', allowedSystems: ['npc.individual'], prohibitedAuthority: ['other.npcs.private_memory', 'world.persistence', 'account.auth'], requiredContext: ['individual memory', 'relationships', 'current situation', 'known observations'] },
  { id: WORLD_AI_AGENTS.economy, version: '1.0.0', allowedSystems: ['economy.prices', 'economy.inventory', 'economy.jobs'], prohibitedAuthority: ['world.time', 'account.auth'], requiredContext: ['transactions', 'supply', 'demand', 'world rules'] },
  { id: WORLD_AI_AGENTS.memory, version: '1.0.0', allowedSystems: ['memory'], prohibitedAuthority: ['world.persistence', 'account.auth'], requiredContext: ['event', 'entity identity', 'existing memories'] },
  { id: WORLD_AI_AGENTS.relationship, version: '1.0.0', allowedSystems: ['social.relationships'], prohibitedAuthority: ['private memories of unrelated entities', 'world.time'], requiredContext: ['observed interactions', 'relationship history'] },
  { id: WORLD_AI_AGENTS.calendar, version: '1.0.0', allowedSystems: ['calendar.events'], prohibitedAuthority: ['world.time', 'account.auth'], requiredContext: ['world events', 'known schedules', 'world rules'] },
  { id: WORLD_AI_AGENTS.narrative, version: '1.0.0', allowedSystems: ['narrative.presentation'], prohibitedAuthority: ['canonical state mutation', 'world.time', 'persistence'], requiredContext: ['approved world facts', 'player-visible observations'] },
  { id: WORLD_AI_AGENTS.diagnostics, version: '1.0.0', allowedSystems: ['diagnostics'], prohibitedAuthority: ['canonical gameplay state mutation', 'world.persistence'], requiredContext: ['diagnostic reports', 'change history', 'dependency graph'] },
];
