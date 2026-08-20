import type { WorldId } from './types.js';

export interface AgeCompatibilityInput {
  playerAge: number;
  npcAge: number;
  worldId?: WorldId;
}

/**
 * Player characters are adults (18+) and the simulation never generates a
 * romantic candidate more than ten years older than the adult player.
 * Compatibility is a boundary, not a claim that attraction exists.
 */
export function isRomanticallyAgeCompatible({ playerAge, npcAge }: AgeCompatibilityInput): boolean {
  if (playerAge < 18 || npcAge < 18) return false;
  return npcAge <= playerAge + 10;
}

export function validatePlayableAge(age: number): void {
  if (!Number.isInteger(age) || age < 18) throw new Error('PLAYABLE_CHARACTER_MUST_BE_18_PLUS');
}
