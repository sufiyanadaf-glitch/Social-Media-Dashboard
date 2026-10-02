/* Demo authentication (prototype only).
   - Password is compared as a SHA-256 hash, never stored in plain text.
   - Session lives in sessionStorage and expires after 30 minutes of inactivity.
   - 3 failed attempts lock the form for 30 seconds.
   A production system must do all of this on the server (hashed+salted
   passwords, HTTPS, httpOnly cookies, OAuth for platform APIs). */
const AUTH = {
  user: 'admin@smd.demo',
  hash: 'ccf405236dcb3319b2bf0f010826617cdae0bf8adbdf92d539bdb3a9755556fe',
  key: 'smd_session',
  idleMs: 30 * 60 * 1000,
  maxAttempts: 3,
  lockMs: 30 * 1000
};

async function sha256(text) {
  if (!(window.crypto && crypto.subtle)) {
    throw new Error('Secure hashing is unavailable. Open the app via http://localhost or a modern browser.');
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function readSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(AUTH.key));
    if (!s || Date.now() - s.last > AUTH.idleMs) return null;
    return s;
  } catch (e) { return null; }
}

function touchSession() {
  const s = readSession();
  if (s) {
    s.last = Date.now();
    sessionStorage.setItem(AUTH.key, JSON.stringify(s));
  }
}

async function login(email, password) {
  const hash = await sha256(password);
  if (email.trim().toLowerCase() === AUTH.user && hash === AUTH.hash) {
    sessionStorage.setItem(AUTH.key, JSON.stringify({ user: AUTH.user, last: Date.now() }));
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(AUTH.key);
  window.location.href = 'index.html';
}

function requireAuth() {
  const s = readSession();
  if (!s) { window.location.replace('index.html'); return null; }
  ['click', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, touchSession, { passive: true }));
  setInterval(() => { if (!readSession()) logout(); }, 15000);
  return s;
}
