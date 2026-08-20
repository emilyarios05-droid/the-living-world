import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel } from '../src/index.js';
import { createConstitution, addRule } from '../src/world/rules.js';
import { validateWorld } from '../src/world/preflight.js';

test('fresh world passes deterministic preflight with only expected history warning removed by kernel creation', () => {
  const state = createKernel('account-a', 1_000).state;
  const constitution = createConstitution(state.metadata.id);
  const report = validateWorld(state, constitution);
  assert.equal(report.passed, true);
});

test('preflight catches rules belonging to another world', () => {
  const state = createKernel('account-a', 1_000).state;
  const constitution = addRule(createConstitution(state.metadata.id), {
    id: 'bad-rule',
    worldId: 'another-world' as typeof state.metadata.id,
    category: 'physics',
    title: 'Bad rule',
    description: 'Should fail validation.',
    stability: 'foundational',
    source: 'player',
    version: 1,
  });
  const report = validateWorld(state, constitution);
  assert.equal(report.passed, false);
  assert.ok(report.issues.some((issue) => issue.code === 'RULE_WORLD_MISMATCH'));
});
