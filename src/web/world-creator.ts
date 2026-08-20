import { WORLD_RULE_CATEGORIES, createConstitution, upsertPlayerRule, validateConstitution, lockFoundationalRules, type WorldConstitution } from '../world/rules.js';
import type { LivingWorldKernel } from '../index.js';
import type { WorldSessionManager } from './world-session.js';
import type { WorldGenerationSpec } from '../world/generation.js';

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&#34;' })[character] ?? character);

export function renderWorldCreator(app: HTMLDivElement, kernel: LivingWorldKernel, session: WorldSessionManager, onComplete: (nextKernel: LivingWorldKernel) => void): void {
  let constitution: WorldConstitution = kernel.state.constitution?.worldId === kernel.state.metadata.id ? kernel.state.constitution : createConstitution(kernel.state.metadata.id);
  const existingSpec = kernel.state.generation?.spec;

  app.innerHTML = `
    <main class="creator-shell">
      <header class="topbar creator-topbar"><div><p class="eyebrow">${existingSpec ? 'WORLD SETTINGS' : 'NEW WORLD'}</p><h1>${existingSpec ? 'Shape the world' : 'Build the rules of your reality'}</h1></div><div class="account-panel"><span class="status-pill">● Draft</span><span class="status-pill cloud">World ${escapeHtml(kernel.state.metadata.id.slice(0, 8))}</span></div></header>
      <section class="creator-intro hero-card"><p class="eyebrow">WORLD IDENTITY</p><h2>Give the simulation its starting reality.</h2><p>The generator creates the initial geography, settlements, locations, population, economy and fixed map hierarchy from these choices. Later AI systems can evolve the world without replacing its history.</p><div class="world-spec-grid"><label class="rule-input"><span>World name</span><input id="world-name" value="${escapeHtml(existingSpec?.name ?? 'A New Living World')}" maxlength="80" /></label><label class="rule-input"><span>Genre</span><select id="world-genre"><option value="fantasy">Fantasy</option><option value="romantasy">Romantasy</option><option value="science-fiction">Science fiction</option><option value="modern">Modern</option><option value="historical">Historical</option><option value="custom">Custom</option></select></label><label class="rule-input"><span>Tone / aesthetic</span><input id="world-tone" value="${escapeHtml(existingSpec?.tone ?? 'beautiful, grounded, immersive, emotionally realistic')}" maxlength="240" /></label></div></section>
      <form id="rules-form" class="rules-grid">${WORLD_RULE_CATEGORIES.map((category) => `<article class="rule-card" data-rule-card="${category.id}"><div class="rule-card-head"><div><span class="slot">${category.stability === 'foundational' ? 'FOUNDATIONAL' : 'EVOLVING'}</span><h3>${escapeHtml(category.name)}</h3></div></div><p>${escapeHtml(category.description)}</p><div class="rule-example"><strong>Example</strong><span>${escapeHtml(category.example)}</span></div><label class="rule-input"><span>Your rule (optional)</span><textarea name="${category.id}" rows="3" placeholder="${escapeHtml(category.placeholder)}"></textarea></label></article>`).join('')}</form>
      <section class="creator-actions"><div id="creator-status" class="subtle">Nothing is locked yet. You can edit your choices.</div><div class="card-actions"><button class="ghost" id="save-draft" type="button">Save draft</button><button class="primary" id="finish-world" type="button">${existingSpec ? 'Save changes' : 'Generate world'}</button></div></section>
    </main>`;

  const form = document.querySelector<HTMLFormElement>('#rules-form');
  const status = document.querySelector<HTMLDivElement>('#creator-status');
  const genreField = document.querySelector<HTMLSelectElement>('#world-genre');
  if (existingSpec && genreField) genreField.value = existingSpec.genre;

  const collect = (): WorldConstitution => {
    let next = constitution;
    for (const category of WORLD_RULE_CATEGORIES) {
      const field = form?.elements.namedItem(category.id) as HTMLTextAreaElement | null;
      if (field?.value.trim()) next = upsertPlayerRule(next, category.id, field.value);
    }
    return next;
  };

  const collectSpec = (): WorldGenerationSpec => ({
    name: document.querySelector<HTMLInputElement>('#world-name')?.value.trim() || 'A New Living World',
    genre: (genreField?.value || 'fantasy') as WorldGenerationSpec['genre'],
    tone: document.querySelector<HTMLInputElement>('#world-tone')?.value.trim() || 'beautiful, grounded, immersive, emotionally realistic',
    seed: kernel.state.metadata.id,
  });

  const save = async (finalize: boolean) => {
    try {
      const draft = collect();
      const errors = validateConstitution(draft);
      if (errors.length) throw new Error(errors.join(' '));
      constitution = finalize ? lockFoundationalRules(draft) : draft;
      let nextKernel = session.withConstitution(kernel, constitution);
      if (finalize && !nextKernel.state.generation) nextKernel = await session.withGeneratedWorld(nextKernel, collectSpec());
      await session.save(nextKernel, finalize ? 'world-generated' : 'world-rules-draft');
      kernel = nextKernel;
      if (status) status.textContent = finalize ? `World ready: ${nextKernel.state.generation?.regions.length ?? 0} regions, ${nextKernel.state.generation?.settlements.length ?? 0} settlements, ${nextKernel.state.generation?.npcs.length ?? 0} initial NPCs, and fixed map hierarchy generated.` : 'Draft saved. Your world is safely persisted.';
      if (finalize) onComplete(nextKernel);
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : String(error);
    }
  };

  document.querySelector<HTMLButtonElement>('#save-draft')?.addEventListener('click', () => void save(false));
  document.querySelector<HTMLButtonElement>('#finish-world')?.addEventListener('click', () => void save(true));
}
