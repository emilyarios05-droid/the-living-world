import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('APP_ROOT_MISSING');

const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);

const realClock = () => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date());

function render(message = ''): void {
  app.innerHTML = `
    <main class="auth-shell">
      <section class="auth-card">
        <div class="brand-mark">✦</div>
        <p class="eyebrow">A living world simulation</p>
        <h1>The Living World</h1>
        <p class="subtle">A world that remembers, changes, and keeps living.</p>
        <div id="auth-content"></div>
        ${message ? `<p class="message" role="status">${escapeHtml(message)}</p>` : ''}
      </section>
    </main>`;

  const content = document.querySelector<HTMLDivElement>('#auth-content');
  if (!content) return;

  content.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab active" data-auth-tab="login">Log in</button>
      <button class="tab" data-auth-tab="signup">Create account</button>
    </div>
    <form id="auth-form" class="form">
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required minlength="8" /></label>
      <div id="username-field" class="hidden">
        <label>Permanent username<input name="username" type="text" autocomplete="nickname" minlength="2" maxlength="32" /></label>
      </div>
      <button class="primary" type="submit">Log in</button>
    </form>
    <div class="auth-actions">
      <button class="link-button" id="forgot-password">Forgot password?</button>
      <button class="link-button" id="recover-account">Recover account</button>
    </div>`;

  const form = document.querySelector<HTMLFormElement>('#auth-form');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const usernameField = document.querySelector<HTMLDivElement>('#username-field');
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-auth-tab]')];
  let mode: 'login' | 'signup' = 'login';

  const setMode = (next: 'login' | 'signup') => {
    mode = next;
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.authTab === next));
    usernameField?.classList.toggle('hidden', next !== 'signup');
    if (submit) submit.textContent = next === 'login' ? 'Log in' : 'Create account';
    if (form) form.password.autocomplete = next === 'login' ? 'current-password' : 'new-password';
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.authTab as 'login' | 'signup')));

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabase) return render('Connect the Supabase environment variables before using authentication.');
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const username = String(data.get('username') ?? '').trim();
    if (mode === 'signup' && !username) return render('A permanent username is required.');

    if (submit) submit.disabled = true;
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (submit) submit.disabled = false;

    if (result.error) return render(result.error.message);
    if (result.data.session) return showHome(result.data.user);
    render(mode === 'signup' ? 'Account created. Check your email if confirmation is required, then log in.' : 'Check your account email for the next step.');
  });

  document.querySelector<HTMLButtonElement>('#forgot-password')?.addEventListener('click', async () => {
    if (!supabase) return render('Connect the Supabase environment variables before using account recovery.');
    const email = window.prompt('Enter the email for your account:')?.trim();
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    render(error ? error.message : 'If that account exists, a password recovery email has been sent.');
  });

  document.querySelector<HTMLButtonElement>('#recover-account')?.addEventListener('click', () => {
    render('Account recovery uses your verified email. If you cannot access it, the next recovery layer will be added before launch.');
  });
}

async function showHome(user: User | null): Promise<void> {
  if (!supabase || !user) return render('Your session could not be established.');
  const { data: profile } = await supabase.from('profiles').select('username').eq('user_id', user.id).maybeSingle();
  const username = profile?.username ?? 'Player';

  app.innerHTML = `
    <main class="home-shell">
      <header class="topbar">
        <div><p class="eyebrow">THE LIVING WORLD</p><h1>Home</h1></div>
        <div class="account-panel">
          <strong>${escapeHtml(username)}</strong>
          <span id="real-clock">${realClock()}</span>
          <span class="status-pill">● Logged in</span>
          <span class="status-pill cloud">☁ Cloud active</span>
          <button class="ghost" id="change-password">Change password</button>
          <button class="ghost" id="logout">Log out</button>
        </div>
      </header>

      <section class="hero-card">
        <p class="eyebrow">YOUR WORLDS</p>
        <h2>Three lives. One world at a time.</h2>
        <p>Every world has its own history, people, memories, economy, rules, and future. Nothing from another world is allowed to bleed into it.</p>
      </section>

      <section>
        <div class="section-heading"><h2>Saved worlds</h2><button class="primary compact" id="new-world">+ New game</button></div>
        <div id="world-list" class="world-grid"><div class="loading">Loading worlds…</div></div>
      </section>

      <section class="game-description">
        <p class="eyebrow">THE GAME</p>
        <h2>A living world, not a predetermined story.</h2>
        <p>The world keeps time, remembers what happened, changes its people and economy, and continues while you are away. Your choices shape what happens, but the world is never required to obey you.</p>
      </section>
    </main>`;

  const clock = document.querySelector<HTMLSpanElement>('#real-clock');
  window.setInterval(() => { if (clock) clock.textContent = realClock(); }, 1_000);

  document.querySelector<HTMLButtonElement>('#logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    render();
  });

  document.querySelector<HTMLButtonElement>('#change-password')?.addEventListener('click', async () => {
    const password = window.prompt('Choose a new password (at least 8 characters):') ?? '';
    if (password.length < 8) return showHome(user);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) window.alert(error.message);
  });

  await loadWorlds(user);
  document.querySelector<HTMLButtonElement>('#new-world')?.addEventListener('click', () => createNewWorld(user));
}

async function loadWorlds(user: User): Promise<void> {
  if (!supabase) return;
  const list = document.querySelector<HTMLDivElement>('#world-list');
  if (!list) return;
  const { data, error } = await supabase
    .from('worlds')
    .select('id,status,created_at,updated_at,world_time_ms')
    .eq('owner_account_id', user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: true });
  if (error) {
    list.innerHTML = `<div class="error-card">${escapeHtml(error.message)}</div>`;
    return;
  }

  const worlds = data ?? [];
  const cards = worlds.map((world, index) => `
    <article class="world-card">
      <span class="slot">WORLD ${index + 1}</span>
      <h3>Untitled world</h3>
      <p class="subtle">Created ${new Date(world.created_at).toLocaleDateString()}</p>
      <p class="world-meta">Status: ${escapeHtml(world.status)} · World time: ${Math.floor(Number(world.world_time_ms) / 3_600_000)}h</p>
      <div class="card-actions">
        <button class="primary compact" data-load-world="${world.id}">Load</button>
        <button class="danger compact" data-delete-world="${world.id}">Delete</button>
      </div>
    </article>`).join('');

  const empty = Array.from({ length: Math.max(0, 3 - worlds.length) }, (_, index) => `
    <article class="world-card empty-card"><span class="slot">WORLD ${worlds.length + index + 1}</span><h3>Empty</h3><p class="subtle">Start a new life here.</p></article>`).join('');

  list.innerHTML = cards + empty;
  list.querySelectorAll<HTMLButtonElement>('[data-delete-world]').forEach((button) => button.addEventListener('click', async () => {
    const id = button.dataset.deleteWorld;
    if (!id || !window.confirm('Delete this entire world? This cannot be undone.')) return;
    const { error: deleteError } = await supabase.from('worlds').delete().eq('id', id);
    if (deleteError) window.alert(deleteError.message);
    else await loadWorlds(user);
  }));

  list.querySelectorAll<HTMLButtonElement>('[data-load-world]').forEach((button) => button.addEventListener('click', () => {
    window.alert('World loading is the next engine/UI slice. The world record is already isolated and persistent.');
  }));
}

async function createNewWorld(user: User): Promise<void> {
  if (!supabase) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from('worlds').insert({
    owner_account_id: user.id,
    status: 'active',
    rules_version: 1,
    world_time_ms: 0,
    started_at_real: now,
    last_advanced_at_real: now,
    event_sequence: 0,
  });
  if (error) window.alert(error.message);
  else await showHome(user);
}

async function bootstrap(): Promise<void> {
  if (!supabase) return render('The app is installed, but its Supabase environment is not configured yet.');
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) await showHome(session.user);
  else render();
  supabase.auth.onAuthStateChange((_event, sessionState) => {
    if (sessionState?.user) void showHome(sessionState.user);
    else render();
  });
}

void bootstrap();
