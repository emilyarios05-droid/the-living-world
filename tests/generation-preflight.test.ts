import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel } from '../src/index.js';
import { generateWorld } from '../src/world/generation.js';
import { initializeLivingSimulation } from '../src/simulation/living-world.js';
import { validateWorld } from '../src/world/preflight.js';

test('preflight accepts a complete generated world', () => {
  const kernel = createKernel('account-a', 1_000);
  const generated = generateWorld(kernel.state.metadata.id, { name: 'Asterra', genre: 'fantasy', tone: 'grounded', seed: kernel.state.metadata.id }, new Date(2_000));
  const state = { ...kernel.state, generation: generated, simulation: initializeLivingSimulation(kernel.state.metadata.id, generated) };
  const report = validateWorld(state, state.constitution);
  assert.equal(report.passed, true);
  assert.equal(report.issues.some((issue) => issue.severity === 'error'), false);
});

test('preflight catches an invalid fixed-map hierarchy', () => {
  const kernel = createKernel('account-a', 1_000);
  const generated = generateWorld(kernel.state.metadata.id, { name: 'Asterra', genre: 'fantasy', tone: 'grounded', seed: kernel.state.metadata.id }, new Date(2_000));
  const state = { ...kernel.state, generation: { ...generated, maps: [] }, simulation: initializeLivingSimulation(kernel.state.metadata.id, generated) };
  const report = validateWorld(state, state.constitution);
  assert.equal(report.passed, false);
  assert.equal(report.issues.some((issue) => issue.code === 'GENERATION_HAS_NO_MAPS'), true);
});
