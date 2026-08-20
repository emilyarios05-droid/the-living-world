import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel, tick } from '../src/index.js';
import { advanceClock, createClock } from '../src/core/clock.js';
import { DiagnosticsRegistry } from '../src/diagnostics/registry.js';
import type { WorldId } from '../src/core/types.js';

test('world identity is unique and state is isolated', () => {
  const a = createKernel('account-a', 1_000);
  const b = createKernel('account-a', 1_000);

  assert.notEqual(a.state.metadata.id, b.state.metadata.id);
  assert.equal(a.state.metadata.ownerAccountId, 'account-a');
  assert.equal(b.state.metadata.ownerAccountId, 'account-a');
});

test('clock advances by real elapsed time and never backwards', () => {
  const clock = createClock('world-1' as WorldId, 1_000);
  const advanced = advanceClock(clock, 3_500);
  assert.equal(advanced.elapsedRealMs, 2_500);
  assert.equal(advanced.clock.worldTimeMs, 2_500);

  const backwards = advanceClock(advanced.clock, 2_000);
  assert.equal(backwards.elapsedRealMs, 0);
  assert.equal(backwards.clock.worldTimeMs, 2_500);
  assert.equal(backwards.clock.lastAdvancedAtReal, advanced.clock.lastAdvancedAtReal);
});

test('kernel tick records elapsed time as a domain event', () => {
  const kernel = createKernel('account-a', 10_000);
  const next = tick(kernel, 15_000);

  assert.equal(next.state.clock.worldTimeMs, 5_000);
  assert.equal(next.state.eventSequence, 2);
});

test('event bus rejects cross-world publication', () => {
  const kernel = createKernel('account-a', 10_000);
  assert.throws(() => {
    kernel.events.publish(
      { type: 'WORLD_CREATED', worldId: 'other-world' as WorldId, at: kernel.state.metadata.createdAt },
      kernel.state.metadata.id,
    );
  }, /EVENT_WORLD_BOUNDARY_VIOLATION/);
});

test('diagnostics detects missing dependencies and health-check failures', () => {
  const diagnostics = new DiagnosticsRegistry();
  diagnostics.register({
    id: 'healthy',
    version: '1.0.0',
    owner: 'TestOwner',
    dependencies: [],
    invariants: [],
    healthCheck: () => 'healthy',
  });
  diagnostics.register({
    id: 'dependent',
    version: '1.0.0',
    owner: 'TestOwner',
    dependencies: ['missing'],
    invariants: [],
    healthCheck: () => 'healthy',
  });

  const report = diagnostics.check('dependent');
  assert.equal(report.health, 'failed');
  assert.deepEqual(report.failures, ['MISSING_DEPENDENCY:missing']);
});
