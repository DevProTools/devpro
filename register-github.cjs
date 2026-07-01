const puppeteer = require('puppeteer-core');
const Imap = require('imap');
const fs = require('fs');

const LOG = f => fs.appendFileSync('/tmp/github-reg.log', new Date().toISOString() + ' ' + f + '\n');
const EMAIL = '694715959@qq.com';
const PASSWORD = Array.from({length:20},()=>'abcdefghijklmnopqrstuvwxyz0123456789!@#'[Math.floor(Math.random()*62)]).join('');
const USERNAME = 'devpro_' + Math.random().toString(36).substring(2, 8);

LOG('USERNAME: ' + USERNAME);
LOG('PASSWORD: ' + PASSWORD);

function waitForCode(timeout = 180000) {
  return new Promise(resolve => {
    const start = Date.now();
    function check() {
      if (Date.now() - start > timeout) { resolve(null); return; }
      const imap = new Imap({ user: EMAIL, password: 'jbjjasbnvrecbdaj', host: 'imap.qq.com', port: 993, tls: true, tlsOptions: { rejectUnauthorized: false }, connTimeout: 5000 });
      imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
          if (err) { imap.end(); setTimeout(check, 3000); return; }
          imap.search([['SINCE', new Date(Date.now() - 1800000).toISOString().split('T')[0]]], (err, results) => {
            if (err || !results || results.length === 0) { imap.end(); setTimeout(check, 3000); return; }
            const toFetch = results.slice(-5);
            const fetch = imap.fetch(toFetch, { bodies: ['TEXT'] });
            let done = false;
            fetch.on('message', msg => { msg.on('body', (stream) => {
              let buf = '';
              stream.on('data', c => buf += c.toString());
              stream.on('end', () => {
                if (!buf.toLowerCase().includes('github')) return;
                const m = buf.match(/(\d{6})/);
                if (m) { done = true; imap.end(); LOG('CODE: ' + m[1]); resolve(m[1]); }
              });
            });});
            fetch.once('end', () => { if (!done) { imap.end(); setTimeout(check, 3000); } });
          });
        });
      });
      imap.once('error', () => setTimeout(check, 3000));
      imap.connect();
    }
    check();
  });
}

(async () => {
  LOG('Starting browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  await page.goto('https://github.com/signup', { timeout: 60000, waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Fill form
  await page.type('input[name="user[email]"]', EMAIL, {delay: 30});
  await page.type('input[name="user[password]"]', PASSWORD, {delay: 20});
  await page.type('input[name="user[login]"]', USERNAME, {delay: 30});
  await new Promise(r => setTimeout(r, 500));
  LOG('Form filled');

  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  LOG('After submit: ' + text.replace(/\n/g, ' | ').substring(0, 300));

  // Check if verification puzzle exists
  const hasChallenge = await page.evaluate(() => {
    return document.body.innerText.toLowerCase().includes('verify') || 
           document.querySelector('[class*="captcha"]') !== null ||
           document.querySelector('[class*="challenge"]') !== null;
  });
  
  if (hasChallenge) {
    LOG('CAPTCHA/Challenge detected! Attempting...');
    const challengeBtn = await page.$('button:has-text("Verify")') || await page.$('[class*="challenge"] button');
    if (challengeBtn) { await challengeBtn.click(); await new Promise(r => setTimeout(r, 5000)); }
  }

  // Wait for email verification
  LOG('Waiting for verification code email...');
  const code = await waitForCode(180000);

  if (code) {
    LOG('Code received: ' + code);
    // Try to enter code
    try {
      const codeInput = await page.$('input[type="text"]') || await page.$('input[type="number"]');
      if (codeInput) {
        await codeInput.type(code, {delay: 30});
        await new Promise(r => setTimeout(r, 1000));
        LOG('Code entered');
      }
    } catch(e) { LOG('Code entry failed: ' + e.message); }
    
    await new Promise(r => setTimeout(r, 5000));
    const finalText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    LOG('Final page: ' + finalText.replace(/\n/g, ' | ').substring(0, 200));
  } else {
    LOG('No verification code received within timeout');
  }

  // Save credentials
  fs.writeFileSync('/tmp/github-creds.json', JSON.stringify({
    username: USERNAME, email: EMAIL, password: PASSWORD, status: code ? 'registered' : 'pending'
  }, null, 2));

  await browser.close();
  LOG('DONE');
})().catch(e => { LOG('FATAL: ' + e.message); process.exit(1); });
