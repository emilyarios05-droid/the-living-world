import { describe, expect, it } from 'vitest';
import { eligibleOffspring, hasHiddenLegacyContinuation, type OffspringCandidate } from './legacy-life.js';

const child = (age: number, alive = true): OffspringCandidate => ({
  id: `child-${age}`,
  name: `Child ${age}`,
  age,
  parentWorldId: 'world-test' as OffspringCandidate['parentWorldId'],
  alive,
  relationshipToPlayer: 'child',
});

describe('legacy life', () => {
  it('only exposes continuation for living adult offspring', () => {
    expect(eligibleOffspring([child(17), child(18, false), child(18), child(30)])).toHaveLength(2);
  });

  it('keeps the continuation option hidden without an eligible child', () => {
    expect(hasHiddenLegacyContinuation([child(17), child(18, false)])).toBe(false);
    expect(hasHiddenLegacyContinuation([child(18)])).toBe(true);
  });
});
