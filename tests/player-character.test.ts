import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePlayerCharacter, wordCount, type PlayerCharacter } from '../src/player/character.js';

const worldId = 'world-1' as PlayerCharacter['worldId'];
const base: PlayerCharacter = {
  id: 'character-1' as PlayerCharacter['id'], worldId, name: 'Avery', age: 18, role: 'artist', backstory: 'A short history.', pov: 'first-person', educationStart: 'post-adolescent-schooling',
  avatar: { body: 'average height', face: 'round face', hair: 'dark curls', clothing: 'casual', aesthetic: 'soft', distinguishingFeatures: '', accessories: '', visualMood: 'warm' }, createdAt: new Date().toISOString(),
};

test('player character cannot be under 18', () => {
  const issues = validatePlayerCharacter({ ...base, age: 17 }, worldId);
  assert.equal(issues.some((issue) => issue.field === 'age'), true);
});

test('backstory is capped at 2,000 words', () => {
  const tooLong = Array.from({ length: 2001 }, () => 'word').join(' ');
  assert.equal(wordCount(tooLong), 2001);
  assert.equal(validatePlayerCharacter({ ...base, backstory: tooLong }, worldId).some((issue) => issue.field === 'backstory'), true);
});

test('character cannot cross world boundaries', () => {
  const issues = validatePlayerCharacter({ ...base, worldId: 'world-2' as PlayerCharacter['worldId'] }, worldId);
  assert.equal(issues.some((issue) => issue.field === 'worldId'), true);
});
