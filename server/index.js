// DevPro Server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { ensureDb } from './db.js';
import { addLead, getLeads } from './db.js';
import { requireAuth } from './auth.js';
import { login, register } from './auth.js';
import { getBtcPrice, getWalletInfo, checkPayments } from './btc.js';
import { createCheckoutSession, handleWebhook } from './stripe.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Security ---
const TUNNEL_URL = (() => { try {
  const log = readFileSync('/tmp/devpro-tunnel.log', 'utf-8');
  const m = log.match(/https:\/\/[^ ]*\.serveousercontent\.com/);
  return m ? m[0] : null;
} catch { return null; }})();

function requireAdmin(req, res, next) {
  let token = '';
  try {
    if (existsSync('/Users/ouze/Desktop/DevPro/.admin-token'))
      token = readFileSync('/Users/ouze/Desktop/DevPro/.admin-token', 'utf-8').trim();
  } catch {}
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== token)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

const PORT = process.env.PORT || 3000;

// Initialize database
ensureDb();

const app = express();

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://api.qrserver.com'],
      connectSrc: ["'self'", 'https://api.blockchain.info', 'https://mempool.space'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

function allowedOrigin(origin) {
  if (!origin) return true;
  if (origin.startsWith('http://localhost')) return true;
  if (origin.endsWith('.serveousercontent.com')) return true;
  return false;
}
app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));

app.use(express.json({ limit: '10kb' }));

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});
app.use('/api', apiLimiter);

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', stripe: !!process.env.STRIPE_SECRET_KEY });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || !validateEmail(email)) return res.status(400).json({ error: 'Valid email and password required' });
  const result = login(email, password);
  if (result.error) return res.status(401).json(result);
  res.json(result);
});

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || !validateEmail(email)) return res.status(400).json({ error: 'Valid email and password required' });
  const result = register(email, password);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, isPro: req.user.isPro } });
});

// Leads
app.post('/api/leads', (req, res) => {
  const { email, message } = req.body || {};
  if (!email || !validateEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  const lead = addLead(email, message || '');
  res.json({ success: true, message: 'Thanks! We will be in touch.' });
});

app.get('/api/leads', requireAdmin, (req, res) => {
  res.json({ leads: getLeads() });
});

// BTC Payment API
app.get('/api/btc/price', async (req, res) => {
  const data = await getBtcPrice();
  res.json(data);
});

app.get('/api/btc/info', (req, res) => {
  try {
    res.json(getWalletInfo());
  } catch (e) {
    res.status(500).json({ error: 'Wallet not configured' });
  }
});

app.get('/api/btc/check', requireAdmin, async (req, res) => {
  const data = await checkPayments();
  res.json(data);
});

// Stripe
app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const result = await createCheckoutSession(req.user.id, req.user.email);
    res.json(result);
  } catch (e) {
    console.error('Stripe error:', e);
    res.status(500).json({ error: 'Payment error' });
  }
});

app.post('/api/stripe/webhook', async (req, res) => {
  await handleWebhook(req, res);
});

// --- Static files (built frontend) ---
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(join(distPath, 'index.html'));
});

// --- Start ---

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`DevPro server running at http://localhost:${PORT}`);
  console.log(`Stripe: ${process.env.STRIPE_SECRET_KEY ? 'configured' : 'dev mode (no payments)'}`);
});
