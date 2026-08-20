import { createClient } from '@supabase/supabase-js';
import './styles.css';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('APP_ROOT_MISSING');
if (!url || !key) throw new Error('SUPABASE_ENV_MISSING');

const supabase = createClient(url, key);

app.innerHTML = `
  <main class="auth-shell">
    <section class="auth-card">
      <div class="brand-mark">✦</div>
      <p class="eyebrow">Account recovery</p>
      <h1>Choose a new password</h1>
      <p class="subtle">This link is temporary. Choose a new password and your account will use it immediately.</p>
      <form id="reset-form" class="form">
        <label>New password<input name="password" type="password" minlength="8" autocomplete="new-password" required /></label>
        <label>Confirm password<input name="confirm" type="password" minlength="8" autocomplete="new-password" required /></label>
        <button class="primary" type="submit">Update password</button>
      </form>
      <p id="reset-message" class="message hidden" role="status"></p>
    </section>
  </main>`;

const form = document.querySelector<HTMLFormElement>('#reset-form');
const message = document.querySelector<HTMLParagraphElement>('#reset-message');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const password = String(data.get('password') ?? '');
  const confirm = String(data.get('confirm') ?? '');
  if (password !== confirm) {
    if (message) { message.textContent = 'The passwords do not match.'; message.classList.remove('hidden'); }
    return;
  }

  const button = form.querySelector<HTMLButtonElement>('button');
  if (button) button.disabled = true;
  const { error } = await supabase.auth.updateUser({ password });
  if (button) button.disabled = false;

  if (error) {
    if (message) { message.textContent = error.message; message.classList.remove('hidden'); }
    return;
  }

  await supabase.auth.signOut();
  window.location.assign('/');
});
