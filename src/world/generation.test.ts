import { describe, expect, it } from 'vitest';
import { generateWorld } from './generation.js';

describe('world generation', () => {
  const spec = { name: 'Test World', genre: 'fantasy' as const, tone: 'grounded', seed: 'seed-1' };

  it('is deterministic for the same world seed', () => {
    expect(generateWorld('world-a' as never, spec)).toEqual(generateWorld('world-a' as never, spec));
  });

  it('creates the map hierarchy and fixed building layouts', () => {
    const world = generateWorld('world-a' as never, spec);
    expect(world.maps.some((map) => map.kind === 'world' && map.clickable)).toBe(true);
    expect(world.maps.some((map) => map.kind === 'settlement' && map.clickable)).toBe(true);
    expect(world.maps.some((map) => map.kind === 'building' && !map.clickable)).toBe(true);
  });

  it('generates an economy and a connected starting population', () => {
    const world = generateWorld('world-a' as never, spec);
    expect(world.economy.prices.length).toBeGreaterThan(0);
    expect(world.npcs.length).toBe(24);
    expect(world.npcs.every((npc) => npc.alive && npc.settlementId)).toBe(true);
  });
});
