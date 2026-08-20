import type { LivingWorldKernel } from '../index.js';
import type { WorldSessionManager } from './world-session.js';
import { wordCount, type CharacterPOV, type EducationStart, type PlayerCharacter } from '../player/character.js';
import type { EntityId } from '../core/types.js';

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&#34;' })[character] ?? character);

export function renderCharacterCreator(app: HTMLDivElement, kernel: LivingWorldKernel, session: WorldSessionManager, onComplete: (nextKernel: LivingWorldKernel) => void): void {
  const existing = kernel.state.playerCharacter;
  app.innerHTML = `<main class="creator-shell"><header class="topbar creator-topbar"><div><p class="eyebrow">YOUR CHARACTER</p><h1>Build the life you want to live</h1></div><div class="account-panel"><span class="status-pill">● ${existing ? 'Saved' : 'New life'}</span></div></header><section class="creator-intro hero-card"><p class="eyebrow">CUSTOMIZATION</p><h2>You choose the person. The world decides how reality responds.</h2><p>Your character cannot be under 18. Your backstory is capped at 2,000 words. Avatar details become the prompt for the eventual image-generation system.</p></section><form id="character-form" class="rules-grid">
    <article class="rule-card"><h3>Identity</h3><label class="rule-input">Name<input name="name" required maxlength="80" value="${escapeHtml(existing?.name ?? '')}" /></label><label class="rule-input">Age<input name="age" type="number" min="18" max="120" value="${existing?.age ?? 18}" required /></label><label class="rule-input">Role<input name="role" required maxlength="120" placeholder="artist, student, merchant, healer…" value="${escapeHtml(existing?.role ?? '')}" /></label><label class="rule-input">Point of view<select name="pov"><option value="first-person">First person</option><option value="third-person">Third person</option></select></label><label class="rule-input">Starting education<select name="education"><option value="post-adolescent-schooling">Finished adolescent schooling / entering adult life</option><option value="college">Starting college or equivalent adult education</option><option value="no-schooling-for-now">Skipping further schooling for now</option></select></label></article>
    <article class="rule-card"><h3>Backstory</h3><label class="rule-input">Your history<textarea name="backstory" rows="14" maxlength="14000" placeholder="Who are you? Where did you come from? What matters to you?"></textarea></label><p id="word-count" class="subtle">0 / 2,000 words</p></article>
    <article class="rule-card"><h3>Avatar</h3><label class="rule-input">Body<textarea name="body" rows="3" required placeholder="Build, height, body shape, physical presence…"></textarea></label><label class="rule-input">Face<textarea name="face" rows="3" required placeholder="Face shape, eyes, expression, complexion…"></textarea></label><label class="rule-input">Hair<textarea name="hair" rows="2" required placeholder="Color, length, texture, style…"></textarea></label><label class="rule-input">Clothing style<textarea name="clothing" rows="3" required placeholder="Everyday clothing and fashion style…"></textarea></label></article>
    <article class="rule-card"><h3>Extra visual direction</h3><label class="rule-input">Aesthetic<textarea name="aesthetic" rows="3" placeholder="Gothic, cottagecore, futuristic, royal, streetwear…"></textarea></label><label class="rule-input">Distinguishing features<textarea name="features" rows="3" placeholder="Scars, freckles, tattoos, unusual eyes, etc."></textarea></label><label class="rule-input">Accessories<textarea name="accessories" rows="3" placeholder="Jewelry, glasses, watch, bag, heirlooms…"></textarea></label><label class="rule-input">Visual mood<textarea name="visualMood" rows="3" placeholder="Warm, intimidating, soft, elegant, chaotic…"></textarea></label></article>
  </form><section class="creator-actions"><div id="character-status" class="subtle">Your character is separate from the world rules and saved inside this world's history.</div><button class="primary" id="save-character" type="button">${existing ? 'Save character' : 'Enter the world'}</button></section></main>`;

  const form = document.querySelector<HTMLFormElement>('#character-form');
  const status = document.querySelector<HTMLDivElement>('#character-status');
  const backstory = form?.elements.namedItem('backstory') as HTMLTextAreaElement | null;
  const count = () => { const value = backstory?.value ?? ''; const words = wordCount(value); const label = document.querySelector<HTMLParagraphElement>('#word-count'); if (label) label.textContent = `${words.toLocaleString()} / 2,000 words`; if (words > 2000 && label) label.textContent += ' — too long'; };
  backstory?.addEventListener('input', count); count();

  const setSelect = (name: string, value: string | undefined) => { const field = form?.elements.namedItem(name) as HTMLSelectElement | null; if (field && value) field.value = value; };
  setSelect('pov', existing?.pov); setSelect('education', existing?.educationStart);
  const setValue = (name: string, value: string | undefined) => { const field = form?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null; if (field && value !== undefined) field.value = value; };
  if (existing) { setValue('backstory', existing.backstory); setValue('body', existing.avatar.body); setValue('face', existing.avatar.face); setValue('hair', existing.avatar.hair); setValue('clothing', existing.avatar.clothing); setValue('aesthetic', existing.avatar.aesthetic); setValue('features', existing.avatar.distinguishingFeatures); setValue('accessories', existing.avatar.accessories); setValue('visualMood', existing.avatar.visualMood); }

  document.querySelector<HTMLButtonElement>('#save-character')?.addEventListener('click', async () => {
    if (!form) return;
    try {
      const data = new FormData(form);
      const character: PlayerCharacter = {
        id: (existing?.id ?? crypto.randomUUID()) as EntityId,
        worldId: kernel.state.metadata.id,
        name: String(data.get('name') ?? '').trim(),
        age: Number(data.get('age') ?? 18),
        role: String(data.get('role') ?? '').trim(),
        backstory: String(data.get('backstory') ?? ''),
        pov: String(data.get('pov') ?? 'first-person') as CharacterPOV,
        educationStart: String(data.get('education') ?? 'post-adolescent-schooling') as EducationStart,
        avatar: { body: String(data.get('body') ?? ''), face: String(data.get('face') ?? ''), hair: String(data.get('hair') ?? ''), clothing: String(data.get('clothing') ?? ''), aesthetic: String(data.get('aesthetic') ?? ''), distinguishingFeatures: String(data.get('features') ?? ''), accessories: String(data.get('accessories') ?? ''), visualMood: String(data.get('visualMood') ?? '') },
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      const nextKernel = await session.withPlayerCharacter(kernel, character);
      kernel = nextKernel;
      if (status) status.textContent = 'Character saved. Entering the living world…';
      onComplete(nextKernel);
    } catch (error) { if (status) status.textContent = error instanceof Error ? error.message : String(error); }
  });
}
