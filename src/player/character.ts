import type { EntityId, WorldId } from '../core/types.js';

export type CharacterPOV = 'first-person' | 'third-person';
export type EducationStart = 'post-adolescent-schooling' | 'college' | 'no-schooling-for-now';

export interface AvatarDescription {
  readonly body: string;
  readonly face: string;
  readonly hair: string;
  readonly clothing: string;
  readonly aesthetic: string;
  readonly distinguishingFeatures: string;
  readonly accessories: string;
  readonly visualMood: string;
}

export interface PlayerCharacter {
  readonly id: EntityId;
  readonly worldId: WorldId;
  readonly name: string;
  readonly age: number;
  readonly role: string;
  readonly backstory: string;
  readonly pov: CharacterPOV;
  readonly educationStart: EducationStart;
  readonly avatar: AvatarDescription;
  readonly createdAt: string;
}

export interface CharacterValidationIssue { readonly field: string; readonly message: string; }

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

export function validatePlayerCharacter(character: PlayerCharacter): readonly CharacterValidationIssue[] {
  const issues: CharacterValidationIssue[] = [];
  if (character.worldId !== character.worldId) issues.push({ field: 'worldId', message: 'Character belongs to an invalid world.' });
  if (!character.name.trim()) issues.push({ field: 'name', message: 'Character name is required.' });
  if (!Number.isInteger(character.age) || character.age < 18) issues.push({ field: 'age', message: 'Player characters must be 18 or older.' });
  if (!character.role.trim()) issues.push({ field: 'role', message: 'A role is required.' });
  if (wordCount(character.backstory) > 2000) issues.push({ field: 'backstory', message: 'Backstory cannot exceed 2,000 words.' });
  if (!character.avatar.body.trim() || !character.avatar.face.trim() || !character.avatar.hair.trim() || !character.avatar.clothing.trim()) issues.push({ field: 'avatar', message: 'Body, face, hair, and clothing descriptions are required for avatar generation.' });
  return issues;
}
