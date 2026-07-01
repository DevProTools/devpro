// Bitcoin payment processing
// No accounts needed - self-generated wallet + free public APIs
import { readFileSync, existsSync } from 'node:fs';
import { load as loadDb, save } from './db.js';

const WALLET_PATH = '/Users/ouze/Desktop/DevPro/.wallet';
const BTC_PRICE_API = 'https://api.blockchain.info/ticker';
const MEMPOOL_API = 'https://mempool.space/api';
const PRO_PRICE_USD = 9;

let wallet = null;

function getWallet() {
  if (wallet) return wallet;
  if (!existsSync(WALLET_PATH)) throw new Error('Wallet not found');
  wallet = JSON.parse(readFileSync(WALLET_PATH, 'utf-8'));
  return wallet;
}

export async function getBtcPrice() {
  try {
    const res = await fetch(BTC_PRICE_API);
    const data = await res.json();
    const usd = data.USD ? data.USD.last : 0;
    const btcAmount = usd > 0 ? (PRO_PRICE_USD / usd).toFixed(8) : '0';
    return { usd, btcForPro: btcAmount };
  } catch (e) {
    console.error('Price fetch error:', e.message);
    return { usd: 0, btcForPro: '0' };
  }
}

export function getWalletInfo() {
  const w = getWallet();
  return { address: w.address, format: w.format };
}

export async function checkPayments() {
  const w = getWallet();
  try {
    const res = await fetch(MEMPOOL_API + '/address/' + w.address + '/txs');
    const raw = await res.text();
    let txs;
    try { txs = JSON.parse(raw); } catch { txs = []; }
    if (!Array.isArray(txs)) return { payments: [], newPayments: [], totalReceived: 0 };

    const db = loadDb();
    if (!db.btcPayments) db.btcPayments = [];

    const processed = new Set(db.btcPayments.map(p => p.txid));
    const newPayments = [];

    for (const tx of txs) {
      if (processed.has(tx.txid)) continue;
      let received = 0;
      const outputs = tx.vout || [];
      for (const vout of outputs) {
        if (vout.scriptpubkey_address === w.address) {
          received += vout.value;
        }
      }
      if (received > 0) {
        const payment = {
          txid: tx.txid,
          satoshis: received,
          btc: (received / 1e8).toFixed(8),
          confirmations: tx.status && tx.status.confirmed ? 1 : 0,
          detected: new Date().toISOString(),
          status: tx.status && tx.status.confirmed ? 'confirmed' : 'pending',
        };
        db.btcPayments.push(payment);
        newPayments.push(payment);
      }
    }

    save();

    const total = db.btcPayments.reduce((sum, p) => sum + p.satoshis, 0);
    return { payments: db.btcPayments, newPayments, totalReceived: total };
  } catch (e) {
    console.error('Payment check error:', e.message);
    return { payments: [], newPayments: [], totalReceived: 0 };
  }
}
