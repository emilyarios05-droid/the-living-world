import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel } from '../src/index.js';
import { generateWorld } from '../src/world/generation.js';

test('world generation is deterministic for the same world seed', () => {
  const world = createKernel('account-a', 1_000).state;
  const spec = {
    name: 'Asterra',
    genre: 'fantasy' as const,
    tone: 'beautiful and grounded',
    seed: world.metadata.id,
  };

  const first = generateWorld(world.metadata.id, spec, new Date(2_000));
  const second = generateWorld(world.metadata.id, spec, new Date(2_000));

  assert.deepEqual(first.regions, second.regions);
  assert.deepEqual(first.settlements, second.settlements);
  assert.deepEqual(first.npcs, second.npcs);
  assert.deepEqual(first.economy, second.economy);
});

test('generated world contains the fixed map hierarchy and an initial economy', () => {
  const world = createKernel('account-a', 1_000).state;
  const generated = generateWorld(world.metadata.id, {
    name: 'Asterra',
    genre: 'fantasy',
    tone: 'grounded',
    seed: world.metadata.id,
  }, new Date(2_000));

  assert.equal(generated.status, 'ready');
  assert.equal(generated.maps.filter((map) => map.kind === 'world').length, 1);
  assert.equal(generated.maps.filter((map) => map.kind === 'region').length, 4);
  assert.equal(generated.maps.filter((map) => map.kind === 'settlement').length, 8);
  assert.equal(generated.maps.every((map) => map.fixed), true);
  assert.equal(generated.npcs.length, 24);
  assert.equal(generated.economy.prices.length > 0, true);
});
