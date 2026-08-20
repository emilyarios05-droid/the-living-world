import assert from 'node:assert/strict';
import test from 'node:test';
import { createKernel } from '../src/index.js';
import { generateWorld } from '../src/world/generation.js';
import { canShareFact, initializeSocialState, recordKnowledge } from '../src/simulation/social.js';

test('NPC knowledge does not become omniscient', () => {
  const kernel = createKernel('account-a', 1_000);
  const generated = generateWorld(kernel.state.metadata.id, { name: 'Asterra', genre: 'fantasy', tone: 'grounded', seed: kernel.state.metadata.id });
  const [observer, subject, stranger] = generated.npcs;
  const social = initializeSocialState(kernel.state.metadata.id, generated);
  const fact = { worldId: kernel.state.metadata.id, observerNpcId: observer!.id, subjectEntityId: subject!.id, summary: 'Observed a private conversation.', source: 'direct-observation' as const, confidence: 1, learnedAtWorldTimeMs: 10_000 };
  const next = recordKnowledge(social, fact);
  assert.equal(next.knownFacts.length, 1);
  assert.equal(canShareFact(next.knownFacts[0]!, stranger!.id), true);
  const rumor = recordKnowledge(next, { ...fact, summary: 'A rumor about the same conversation.', source: 'rumor', confidence: 0.35 });
  assert.equal(canShareFact(rumor.knownFacts[1]!, stranger!.id), false);
});
