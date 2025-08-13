// Minimal simulation of the browser environment to run src/app.js
// and verify that the Municipality Selector renders without real DOM.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- Minimal DOM/window stubs ----
const logs = [];

const appContainer = {
  innerHTML: '',
  querySelector() { return null; },
};

const documentStub = {
  readyState: 'complete',
  getElementById(id) {
    if (id === 'app') return appContainer;
    return null;
  },
  addEventListener() { /* no-op */ },
  querySelector() { return null; },
};

const windowStub = {
  addEventListener() { /* no-op */ },
  removeEventListener() { /* no-op */ },
  location: { reload() {} },
};

global.document = documentStub;
global.window = windowStub;

// ---- Stub fetch for API endpoints ----
global.fetch = async (url, options = {}) => {
  // Normalize URL path only
  const u = new URL(url, 'http://127.0.0.1:5001');
  const pathname = u.pathname;

  // Health endpoint
  if (pathname === '/api/health') {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {},
      json: async () => ({ status: 'ok' })
    };
  }

  // Municipalities endpoint
  if (pathname === '/api/municipios') {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {},
      json: async () => ({
        municipalities: [
          { id: 1, nombre: 'Capital', alianzas: [] },
          { id: 2, nombre: 'Goya', alianzas: [] },
          { id: 3, nombre: 'Mercedes', alianzas: [] },
        ],
        metadata: { data_version: 'demo', last_update: new Date().toISOString() }
      })
    };
  }

  // Municipality detail (not used in this simulation)
  if (pathname.startsWith('/api/municipios/')) {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {},
      json: async () => ({ id: 1, nombre: 'Capital', alianzas: [] })
    };
  }

  // Default: 404
  return {
    ok: false,
    status: 404,
    statusText: 'Not Found',
    headers: {},
    json: async () => ({ error: 'Not Found' })
  };
};

// ---- Capture console logs to search for selector render message ----
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

function capture(method, ...args) {
  try { logs.push({ method, msg: args.map(String).join(' ') }); } catch {}
}

console.log = (...a) => { capture('log', ...a); originalLog(...a); };
console.info = (...a) => { capture('info', ...a); originalInfo(...a); };
console.warn = (...a) => { capture('warn', ...a); originalWarn(...a); };
console.error = (...a) => { capture('error', ...a); originalError(...a); };

// ---- Import the app (auto-initializes) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import src/app.js which auto runs initializeGTIntelligence()
await import(path.resolve(__dirname, '../src/app.js'));

// Give some time for async init
await new Promise(r => setTimeout(r, 50));

// Force a view toggle to trigger MunicipalitySelector.show()
const { default: store } = await import('../src/store.js');
store.setState('currentView', 'results');
store.setState('currentView', 'welcome');

// Wait a moment for the selector to render
await new Promise(r => setTimeout(r, 20));

// Check for the selector render log
const found = logs.some(l => /Selector de municipios renderizado/.test(l.msg));

// Output a concise result line for the harness
if (found) {
  console.log('[SIMULATION RESULT] Selector de municipios renderizado: OK');
} else {
  console.log('[SIMULATION RESULT] Selector de municipios renderizado: NOT FOUND');
}

// Also show a small snippet of the app container to ensure content rendered
console.log('[SIMULATION SNIPPET] app.innerHTML length =', appContainer.innerHTML.length);
