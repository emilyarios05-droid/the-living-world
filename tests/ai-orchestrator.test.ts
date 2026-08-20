import assert from 'node:assert/strict';
import test from 'node:test';
import { AIAgentRegistry, AIOrchestrator, WORLD_AI_AGENTS } from '../src/ai/orchestrator.js';
import { INITIAL_AI_AGENT_CONTRACTS } from '../src/ai/agents.js';

test('all initial specialist agents have explicit ownership contracts', () => {
  const registry = new AIAgentRegistry();
  for (const agent of INITIAL_AI_AGENT_CONTRACTS) registry.register(agent);
  assert.equal(registry.list().length, INITIAL_AI_AGENT_CONTRACTS.length);
  assert.equal(registry.get(WORLD_AI_AGENTS.narrative).prohibitedAuthority.includes('canonical state mutation'), true);
  assert.equal(registry.get(WORLD_AI_AGENTS.npcIndividual).prohibitedAuthority.includes('world.persistence'), true);
});

test('orchestrator refuses to invent an AI provider', async () => {
  const registry = new AIAgentRegistry();
  for (const agent of INITIAL_AI_AGENT_CONTRACTS) registry.register(agent);
  const orchestrator = new AIOrchestrator(registry, []);
  const result = await orchestrator.propose(WORLD_AI_AGENTS.economy, 'world-1', { observed: [] });
  assert.equal(result.accepted, false);
  assert.deepEqual(result.issues, ['NO_AI_PROVIDER_CONFIGURED']);
});
