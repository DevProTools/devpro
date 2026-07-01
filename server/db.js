// Simple JSON file-based database
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'db.json');

const DEFAULT_DATA = {
  users: [],
  subscriptions: [],
  usage: [],
};

let data = null;

function load() {
  if (data) return data;
  if (existsSync(DB_PATH)) {
    try {
      data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    } catch {
      data = structuredClone(DEFAULT_DATA);
    }
  } else {
    data = structuredClone(DEFAULT_DATA);
    save();
  }
  return data;
}

function save() {
  const dir = join(__dirname, '..', 'data');
  try { mkdirSync(dir, { recursive: true }); } catch {}
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Public API ---

export function findUser(email) {
  const db = load();
  return db.users.find(u => u.email === email) || null;
}

export function createUser(email, passwordHash) {
  const db = load();
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    isPro: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  return user;
}

export function setProStatus(userId, isPro) {
  const db = load();
  const user = db.users.find(u => u.id === userId);
  if (!user) return false;
  user.isPro = isPro;
  if (isPro) user.proSince = user.proSince || new Date().toISOString();
  save();
  return true;
}

export function getUserById(id) {
  const db = load();
  return db.users.find(u => u.id === id) || null;
}

export { load, save, load as ensureDb };

// --- Leads ---
export function addLead(email, message = '') {
  const db = load();
  const existing = db.users.find(u => u.email === email);
  const lead = {
    id: crypto.randomUUID(),
    email,
    message,
    isExistingUser: !!existing,
    createdAt: new Date().toISOString(),
  };
  if (!db.leads) db.leads = [];
  db.leads.push(lead);
  save();
  return lead;
}

export function getLeads() {
  const db = load();
  return (db.leads || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
