import { describe, expect, it } from 'vitest';
import { isRomanticallyAgeCompatible, validatePlayableAge } from './age-rules.js';

describe('age rules', () => {
  it('requires playable characters to be adults', () => {
    expect(() => validatePlayableAge(17)).toThrow('PLAYABLE_CHARACTER_MUST_BE_18_PLUS');
    expect(() => validatePlayableAge(18)).not.toThrow();
  });

  it('allows an adult NPC up to ten years older', () => {
    expect(isRomanticallyAgeCompatible({ playerAge: 18, npcAge: 28 })).toBe(true);
    expect(isRomanticallyAgeCompatible({ playerAge: 18, npcAge: 29 })).toBe(false);
  });

  it('rejects underage participants regardless of the gap', () => {
    expect(isRomanticallyAgeCompatible({ playerAge: 18, npcAge: 17 })).toBe(false);
    expect(isRomanticallyAgeCompatible({ playerAge: 17, npcAge: 18 })).toBe(false);
  });
});
