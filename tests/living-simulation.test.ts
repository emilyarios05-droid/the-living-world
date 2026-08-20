import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel } from '../src/index.js';
import { generateWorld } from '../src/world/generation.js';
import { advanceLivingSimulation, initializeLivingSimulation } from '../src/simulation/living-world.js';

test('living simulation advances NPC routines and economy from elapsed world time', () => {
  const kernel = createKernel('account-a', 1_000);
  const generated = generateWorld(kernel.state.metadata.id, {
    name: 'Asterra', genre: 'fantasy', tone: 'grounded', seed: kernel.state.metadata.id,
  }, new Date(2_000));
  const initial = initializeLivingSimulation(kernel.state.metadata.id, generated);
  const advanced = advanceLivingSimulation(initial, generated, 0, 24 * 3_600_000);

  assert.notEqual(advanced.npcStates[0]?.lastDecisionWorldTimeMs, 0);
  assert.ok(advanced.npcStates.every((npc) => npc.energy >= 0 && npc.energy <= 100));
  assert.ok(advanced.npcStates.every((npc) => npc.mood >= 0 && npc.mood <= 100));
  assert.ok(advanced.economy.priceMultiplier >= 0.7 && advanced.economy.priceMultiplier <= 1.5);
  assert.notEqual(advanced.economy.lastUpdatedWorldTimeMs, 0);
});
