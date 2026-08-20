import { WORLD_RULE_CATEGORIES, createConstitution, upsertPlayerRule, validateConstitution, lockFoundationalRules, type WorldConstitution } from '../world/rules.js';
import type { LivingWorldKernel } from '../index.js';
import type { WorldSessionManager } from './world-session.js';

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);

export function renderWorldCreator(
  app: HTMLDivElement,
  kernel: LivingWorldKernel,
  session: WorldSessionManager,
  onComplete: (nextKernel: LivingWorldKernel) => void,
): void {
  let constitution: WorldConstitution = kernel.state.constitution?.worldId === kernel.state.metadata.id
    ? kernel.state.constitution
    : createConstitution(kernel.state.metadata.id);

  app.innerHTML = `
    <main class="creator-shell">
      <header class="topbar creator-topbar">
        <div><p class="eyebrow">NEW WORLD</p><h1>Build the rules of your reality</h1></div>
        <div class="account-panel"><span class="status-pill">● Draft</span><span class="status-pill cloud">World ${escapeHtml(kernel.state.metadata.id.slice(0, 8))}</span></div>
      </header>
      <section class="creator-intro hero-card">
        <p class="eyebrow">WORLD CONSTITUTION</p>
        <h2>You decide the important rules. We keep the world consistent.</h2>
        <p>Each category explains what it controls and gives an example. You can leave things blank; the generation system will later propose missing rules when they are needed for consistency.</p>
      </section>
      <form id="rules-form" class="rules-grid">
        ${WORLD_RULE_CATEGORIES.map((category) => `
          <article class="rule-card" data-rule-card="${category.id}">
            <div class="rule-card-head"><div><span class="slot">${category.stability === 'foundational' ? 'FOUNDATIONAL' : 'EVOLVING'}</span><h3>${escapeHtml(category.name)}</h3></div></div>
            <p>${escapeHtml(category.description)}</p>
            <div class="rule-example"><strong>Example</strong><span>${escapeHtml(category.example)}</span></div>
            <label class="rule-input"><span>Your rule (optional)</span><textarea name="${category.id}" rows="3" placeholder="${escapeHtml(category.placeholder)}"></textarea></label>
          </article>`).join('')}
      </form>
      <section class="creator-actions">
        <div id="creator-status" class="subtle">Nothing is locked yet. You can edit your choices.</div>
        <div class="card-actions"><button class="ghost" id="save-draft" type="button">Save draft</button><button class="primary" id="finish-world" type="button">Create world</button></div>
      </section>
    </main>`;

  const form = document.querySelector<HTMLFormElement>('#rules-form');
  const status = document.querySelector<HTMLDivElement>('#creator-status');
  const collect = (): WorldConstitution => {
    let next = constitution;
    for (const category of WORLD_RULE_CATEGORIES) {
      const field = form?.elements.namedItem(category.id) as HTMLTextAreaElement | null;
      if (field?.value.trim()) next = upsertPlayerRule(next, category.id, field.value);
    }
    return next;
  };

  const save = async (finalize: boolean) => {
    try {
      const draft = collect();
      const errors = validateConstitution(draft);
      if (errors.length) throw new Error(errors.join(' '));
      constitution = finalize ? lockFoundationalRules(draft) : draft;
      const nextKernel = session.withConstitution(kernel, constitution);
      await session.save(nextKernel, finalize ? 'world-rules-finalized' : 'world-rules-draft');
      kernel = nextKernel;
      if (status) status.textContent = finalize ? 'World rules locked. Generating the first world slice next.' : 'Draft saved. Your world is safely persisted.';
      if (finalize) onComplete(nextKernel);
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : String(error);
    }
  };

  document.querySelector<HTMLButtonElement>('#save-draft')?.addEventListener('click', () => void save(false));
  document.querySelector<HTMLButtonElement>('#finish-world')?.addEventListener('click', () => void save(true));
}
