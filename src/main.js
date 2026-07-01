import '/src/styles/main.css';

// --- SVG Icons (inline) ---
const ICONS = {
  logo: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230288d1"/><path d="M30 35 L50 20 L70 35 M30 65 L50 80 L70 65 M50 20 L50 80" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  json: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  jwt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1"/></svg>`,
  base64: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  uuid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  regex: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3v9M9 21V3M3 7l18 10M21 7l-18 10"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0 0 14h1a3 3 0 0 1 0 6 7 7 0 0 0 0-14h-1"/></svg>`,
  hash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  diff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 5 19 12"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
};

// --- Tool Definitions ---
const TOOLS = [
  { id: 'json',    label: 'JSON Formatter', icon: 'json',    free: true },
  { id: 'jwt',     label: 'JWT Decoder',    icon: 'jwt',     free: true },
  { id: 'base64',  label: 'Base64',         icon: 'base64',  free: true },
  { id: 'uuid',    label: 'UUID Generator', icon: 'uuid',    free: true },
  { id: 'timestamp', label: 'Timestamp',     icon: 'clock',   free: true },
  { id: 'regex',   label: 'Regex Tester',   icon: 'regex',   free: true },
  { id: 'url',     label: 'URL Encode',     icon: 'link',    free: true },
  { id: 'color',   label: 'Color Converter',icon: 'palette', free: true },
  { id: 'base',    label: 'Number Base',    icon: 'hash',    free: true },
  { id: 'diff',    label: 'Text Diff',      icon: 'diff',    free: false },
];

// --- State ---
const state = {
  currentTool: null,
  isPro: false,
  usageCount: 0,
  dailyLimit: 100,
};

// --- DOM refs ---
let $app, $main, $workbenchBody, $toast;

// --- Toast ---
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  clearTimeout($toast._hide);
  $toast._hide = setTimeout(() => $toast.classList.remove('show'), 1800);
}

// --- Copy helper ---
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Copied!');
  }
}

// --- Theme ---
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('devpro-theme', isDark ? 'light' : 'dark');
  renderHeader();
}

// --- Rate limit ---
function checkLimit() {
  if (state.isPro) return true;
  const today = new Date().toDateString();
  const stored = localStorage.getItem('devpro-usage');
  if (stored) {
    try {
      const { date, count } = JSON.parse(stored);
      if (date === today) state.usageCount = count;
      else state.usageCount = 0;
    } catch { state.usageCount = 0; }
  }
  if (state.usageCount >= state.dailyLimit) return false;
  state.usageCount++;
  localStorage.setItem('devpro-usage', JSON.stringify({ date: today, count: state.usageCount }));
  return true;
}

// --- Render: Header ---
function renderHeader() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelector('.header')?.remove();
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="header-inner">
      <a class="header-brand" href="#">
        ${ICONS.logo}
        DevPro
      </a>
      <div class="header-actions">
        <span class="header-status">${state.isPro ? 'Pro' : 'Free'}</span>
        <button class="theme-toggle" aria-label="Toggle theme" onclick="window.__toggleTheme()">
          ${isDark ? ICONS.sun : ICONS.moon}
        </button>
      </div>
    </div>
  `;
  $app.insertBefore(header, $app.firstChild);
}
window.__toggleTheme = toggleTheme;

// --- Render: Tool Grid ---
function renderToolGrid() {
  const grid = document.createElement('div');
  grid.className = 'tool-grid';
  TOOLS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tool-card' + (state.currentTool === t.id ? ' active' : '');
    card.dataset.tool = t.id;
    card.innerHTML = `
      ${ICONS[t.icon]}
      <span class="tool-label">${t.label}</span>
      ${!t.free ? '<span class="tool-badge">PRO</span>' : ''}
    `;
    card.addEventListener('click', () => selectTool(t.id));
    grid.appendChild(card);
  });
  return grid;
}

// --- Render: Workbench ---
function renderWorkbench(title, icon) {
  return `
    <div class="workbench">
      <div class="workbench-header">
        <div class="workbench-title">${icon} ${title}</div>
        <div class="workbench-actions"></div>
      </div>
      <div class="workbench-body"></div>
    </div>
  `;
}

// --- Render: Empty State ---
function renderEmptyState() {
  return `
    <div class="workbench-empty">
      ${ICONS.code}
      <h3>Select a tool to get started</h3>
      <p>Choose from the tools above. All processing happens locally in your browser — nothing is sent to a server.</p>
    </div>
  `;
}

// --- Render: Pro Overlay ---
function renderProOverlay() {
  return `
    <div class="pro-overlay">
      ${ICONS.lock}
      <h3>Pro Feature</h3>
      <p>Upgrade to Pro to unlock Text Diff and all premium features including unlimited usage, API access, and custom themes.</p>
      <div class="pricing">
        <div class="pricing-card">
          <div class="price">$0<span>/mo</span></div>
          <ul class="features">
            <li>${ICONS.check} 10 core tools</li>
            <li>${ICONS.check} 100 ops/day</li>
            <li>${ICONS.check} Local processing</li>
          </ul>
          <button class="btn" disabled>Current</button>
        </div>
        <div class="pricing-card featured">
          <div class="price">$9<span>/mo</span></div>
          <ul class="features">
            <li>${ICONS.check} All tools + Text Diff</li>
            <li>${ICONS.check} Unlimited usage</li>
            <li>${ICONS.check} REST API access</li>
            <li>${ICONS.check} Dark & custom themes</li>
            <li>${ICONS.check} Priority support</li>
          </ul>
          <button class="btn btn-primary" onclick="window.__upgrade()">${ICONS.zap} Upgrade</button>
        </div>
      </div>
    </div>
  `;
}
window.__upgrade = () => {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--bg-secondary);border-radius:12px;padding:28px;max-width:460px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.3)';
  modal.innerHTML = 
    '<div style="text-align:center;margin-bottom:20px">' +
    '<h3 style="font-size:1.2rem;font-weight:700">Get DevPro Pro</h3>' +
    '<p style="font-size:0.85rem;color:var(--text-secondary);margin-top:4px">$9/mo — unlimited access to all tools</p></div>' +

    '<div id="btc-section">' +
    '<div style="background:var(--bg-tertiary);border-radius:8px;padding:16px;margin-bottom:16px;text-align:center">' +
    '<div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:6px">Pay with Bitcoin</div>' +
    '<div id="btc-loading" style="font-size:0.85rem;color:var(--text-tertiary);padding:8px">Loading BTC price...</div>' +
    '<div id="btc-info" style="display:none">' +
    '<div style="margin-bottom:10px">' +
    '<span id="btc-amount" style="font-size:1.3rem;font-weight:700;font-family:var(--font-mono)"></span>' +
    '<span style="font-size:0.78rem;color:var(--text-secondary);margin-left:6px">BTC</span></div>' +
    '<div style="margin-bottom:10px"><img id="btc-qr" style="width:160px;height:160px;border-radius:8px;background:white;padding:8px" /></div>' +
    '<div id="btc-address" style="font-size:0.72rem;color:var(--text-tertiary);word-break:break-all;background:var(--bg-primary);padding:8px;border-radius:6px;cursor:pointer"></div>' +
    '<div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:6px">Send BTC to this address. Pro access activates automatically.</div>' +
    '</div></div></div>' +

    '<div style="border-top:1px solid var(--border-primary);padding-top:16px">' +
    '<div style="text-align:center;margin-bottom:10px">' +
    '<span style="font-size:0.78rem;color:var(--text-secondary)">Or enter your email:</span></div>' +
    '<div id="upgrade-form">' +
    '<input type="email" id="upgrade-email" placeholder="you@example.com" style="width:100%;padding:10px 14px;font-size:0.9rem;border:1px solid var(--border-primary);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);margin-bottom:10px;font-family:var(--font-sans)" />' +
    '<button id="upgrade-submit" class="btn btn-primary" style="width:100%;justify-content:center">Notify Me</button></div>' +
    '<div id="upgrade-success" style="display:none;color:#34a853;font-weight:500;padding:12px;text-align:center">Thanks! We will be in touch.</div></div>' +
    '<button id="upgrade-close" style="display:block;margin:12px auto 0;background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:0.8rem">Close</button>';

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // BTC payment
  const btcAddr = document.getElementById('btc-address');
  const btcQr = document.getElementById('btc-qr');
  const btcLoading = document.getElementById('btc-loading');
  const btcInfo = document.getElementById('btc-info');
  const btcAmount = document.getElementById('btc-amount');

  btcAddr.onclick = () => {
    navigator.clipboard.writeText(btcAddr.textContent);
    btcAddr.textContent = 'Copied!';
    setTimeout(() => { btcAddr.textContent = window.__btcAddr; }, 1500);
  };

  Promise.all([
    fetch('/api/btc/price').then(r => r.json()),
    fetch('/api/btc/info').then(r => r.json())
  ]).then(([price, wallet]) => {
    if (price.btcForPro && price.btcForPro !== '0') {
      btcAmount.textContent = price.btcForPro;
      btcLoading.style.display = 'none';
      btcInfo.style.display = 'block';
    }
    const addr = wallet.address || 'Loading...';
    window.__btcAddr = addr;
    btcAddr.textContent = addr;
    btcQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=bitcoin:' + encodeURIComponent(addr);
  }).catch(() => { btcLoading.textContent = 'BTC payment unavailable'; });

  // Email capture
  document.getElementById('upgrade-submit').onclick = async () => {
    const email = document.getElementById('upgrade-email').value;
    if (!email || !email.includes('@')) { alert('Please enter a valid email'); return; }
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message: 'Pro upgrade interest' }),
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('upgrade-form').style.display = 'none';
        document.getElementById('upgrade-success').style.display = 'block';
      }
    } catch(e) { alert('Error submitting'); }
  };

  document.getElementById('upgrade-close').onclick = () => overlay.remove();
  document.getElementById('upgrade-email').onkeydown = e => {
    if (e.key === 'Enter') document.getElementById('upgrade-submit').click();
  };
  setTimeout(() => document.getElementById('upgrade-email').focus(), 200);
};// --- Tool Selection ---
async function selectTool(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;

  state.currentTool = toolId;

  // Update grid active state
  document.querySelectorAll('.tool-card').forEach(c => c.classList.toggle('active', c.dataset.tool === toolId));

  // Check pro access
  if (!tool.free && !state.isPro) {
    $workbenchBody.innerHTML = renderProOverlay();
    return;
  }

  // Check rate limit
  if (!checkLimit()) {
    $workbenchBody.innerHTML = `
      <div class="pro-overlay">
        ${ICONS.lock}
        <h3>Daily limit reached</h3>
        <p>You've used all ${state.dailyLimit} free operations today. Upgrade to Pro for unlimited usage.</p>
        <button class="btn btn-primary" onclick="window.__upgrade()">${ICONS.zap} Upgrade to Pro</button>
      </div>
    `;
    return;
  }

  // Update workbench header
  const wb = document.querySelector('.workbench');
  if (wb) {
    wb.querySelector('.workbench-title').innerHTML = `${ICONS[tool.icon]} ${tool.label}`;
  }

  // Load tool module and render
  try {
    const mod = await import(`./tools/${toolId}.js`);
    $workbenchBody.innerHTML = '';
    mod.init($workbenchBody, { copyToClipboard, showToast, ICONS, isPro: state.isPro });
  } catch (e) {
    console.error('Failed to load tool:', e);
    $workbenchBody.innerHTML = `<div class="workbench-empty"><p>Failed to load tool. Please try again.</p></div>`;
  }
}

// --- Init ---
function init() {
  $app = document.getElementById('app');

  // Restore theme
  const savedTheme = localStorage.getItem('devpro-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Restore pro status from URL param
  const params = new URLSearchParams(window.location.search);
  if (params.get('pro') === 'true' || localStorage.getItem('devpro-pro') === 'true') {
    state.isPro = true;
    localStorage.setItem('devpro-pro', 'true');
  }

  // Layout
  renderHeader();

  // Hero
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `<h1>Developer Utilities</h1><p>All tools run locally in your browser. Nothing leaves your machine.</p>`;
  $app.appendChild(hero);

  // Tool grid
  $app.appendChild(renderToolGrid());

  // Workbench
  const wbSection = document.createElement('section');
  wbSection.innerHTML = renderWorkbench('Ready', ICONS.code);
  $app.appendChild(wbSection);

  $workbenchBody = wbSection.querySelector('.workbench-body');
  $workbenchBody.innerHTML = renderEmptyState();

  // Toast
  $toast = document.createElement('div');
  $toast.className = 'toast';
  document.body.appendChild($toast);

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `DevPro — All tools run locally. <a href="/api/health">API</a>`;
  $app.appendChild(footer);
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
