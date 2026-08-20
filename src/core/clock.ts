import type { IsoTimestamp, WorldClock, WorldId } from './types.js';

const iso = (value: number): IsoTimestamp => new Date(value).toISOString() as IsoTimestamp;

export function createClock(worldId: WorldId, nowMs: number): WorldClock {
  const now = iso(nowMs);
  return {
    worldId,
    startedAtReal: now,
    lastAdvancedAtReal: now,
    worldTimeMs: 0,
    paused: false,
  };
}

export function advanceClock(clock: WorldClock, nowMs: number): {
  readonly clock: WorldClock;
  readonly elapsedRealMs: number;
} {
  if (clock.paused) return { clock, elapsedRealMs: 0 };

  const elapsedRealMs = Math.max(0, nowMs - Date.parse(clock.lastAdvancedAtReal));
  return {
    elapsedRealMs,
    clock: {
      ...clock,
      lastAdvancedAtReal: iso(nowMs),
      worldTimeMs: clock.worldTimeMs + elapsedRealMs,
    },
  };
}
