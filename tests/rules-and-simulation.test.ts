import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel } from '../src/index.js';
import { createConstitution, addRule, lockFoundationalRules } from '../src/world/rules.js';
import { resolveCommand } from '../src/simulation/engine.js';
import type { WorldId } from '../src/core/types.js';

test('foundational world rules lock while evolving rules remain possible', () => {
  const world = createKernel('account-a', 1_000).state;
  const base = createConstitution(world.metadata.id);
  const withPhysics = addRule(base, {
    id: 'physics-1',
    worldId: world.metadata.id,
    category: 'physics',
    title: 'Gravity',
    description: 'Gravity behaves consistently.',
    stability: 'foundational',
    source: 'player',
    version: 1,
  });
  const locked = lockFoundationalRules(withPhysics);

  assert.throws(() => addRule(locked, { ...withPhysics.rules[0]!, id: 'physics-2' }), /FOUNDATIONAL_RULES_LOCKED/);

  const evolving = addRule(locked, {
    id: 'law-1',
    worldId: world.metadata.id,
    category: 'law',
    title: 'Current law',
    description: 'A law that can change as the world evolves.',
    stability: 'evolving',
    source: 'world_event',
    version: 1,
  });
  assert.equal(evolving.rules.length, 2);
});

test('simulation rejects commands belonging to another world', () => {
  const state = createKernel('account-a', 1_000).state;
  assert.throws(() => resolveCommand(state, {
    type: 'ADVANCE_TIME',
    worldId: 'wrong-world' as WorldId,
    requestedAtReal: new Date(2_000).toISOString(),
    requestedBy: 'test',
    nowRealMs: 2_000,
  }), /COMMAND_WORLD_BOUNDARY_VIOLATION/);
});

test('simulation delete is explicit and emits a world deletion fact', () => {
  const state = createKernel('account-a', 1_000).state;
  const result = resolveCommand(state, {
    type: 'DELETE_WORLD',
    worldId: state.metadata.id,
    requestedAtReal: new Date(2_000).toISOString(),
    requestedBy: 'test',
  });

  assert.equal(result.state.metadata.status, 'deleted');
  assert.equal(result.events[0]?.type, 'WORLD_DELETED');
});
