// Simple JWT auth without external dependency
import crypto from 'node:crypto';
import { findUser, createUser, getUserById } from './db.js';

const SECRET = process.env.SESSION_SECRET || 'devpro-dev-secret-change-in-production';

function base64url(buf) {
  return buf.toString('base64url');
}

function createToken(payload) {
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
  })));
  const sig = base64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest());
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = base64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest());
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export function login(email, password) {
  const user = findUser(email);
  if (!user) return { error: 'User not found' };

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== user.passwordHash) return { error: 'Invalid password' };

  const token = createToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, isPro: user.isPro } };
}

export function register(email, password) {
  if (findUser(email)) return { error: 'Email already registered' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const user = createUser(email, hash);
  const token = createToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, isPro: false } };
}

export function authenticate(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const payload = verifyToken(auth.slice(7));
  if (!payload) return null;
  const user = getUserById(payload.userId);
  return user || null;
}

export function requireAuth(req, res, next) {
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}
