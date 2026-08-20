import type { IsoTimestamp, WorldClock, WorldId } from './types.js';

const iso = (value: number): IsoTimestamp => new Date(value).toISOString() as IsoTimestamp;

export function createClock(worldId: WorldId, nowMs: number): WorldClock {
  if (!Number.isFinite(nowMs)) throw new Error('INVALID_CLOCK_TIME');
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
  if (!Number.isFinite(nowMs)) throw new Error('INVALID_CLOCK_TIME');
  if (clock.paused) return { clock, elapsedRealMs: 0 };

  const lastRealMs = Date.parse(clock.lastAdvancedAtReal);
  if (!Number.isFinite(lastRealMs)) throw new Error('INVALID_CLOCK_TIMESTAMP');

  // A wall clock correction must never make simulation time move backwards.
  if (nowMs <= lastRealMs) return { clock, elapsedRealMs: 0 };

  const elapsedRealMs = nowMs - lastRealMs;
  return {
    elapsedRealMs,
    clock: {
      ...clock,
      lastAdvancedAtReal: iso(nowMs),
      worldTimeMs: clock.worldTimeMs + elapsedRealMs,
    },
  };
}

export function setClockPaused(clock: WorldClock, paused: boolean, nowMs: number): WorldClock {
  if (!Number.isFinite(nowMs)) throw new Error('INVALID_CLOCK_TIME');
  if (clock.paused === paused) return clock;

  return {
    ...clock,
    paused,
    lastAdvancedAtReal: iso(nowMs),
  };
}
