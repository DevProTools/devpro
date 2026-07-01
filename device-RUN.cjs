const pptr = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const DCODE = '7c0fff48d6808e18de04bc60e65bc7feac2c10eb';

(async () => {
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('https://github.com/login', { timeout: 30000 });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 15000 });
  process.stdout.write('1-Logged in\n');
  
  // Ignore navigation errors (like "frame detached")
  try {
    await page.goto('https://github.com/login/device?skip_account_picker=true', { timeout: 30000 });
  } catch(e) { process.stdout.write('2-Goto: ' + e.message.substring(0,40) + '\n'); }
  
  await page.waitForTimeout(2000).catch(() => new Promise(r => setTimeout(r, 2000)));
  process.stdout.write('3-URL: ' + page.url() + '\n');
  
  // Type code into inputs
  const inputs = await page.$$('input[type="text"]');
  const code = '283A-F847';
  process.stdout.write('4-Inputs: ' + inputs.length + '\n');
  
  for (let i = 0; i < inputs.length && i < code.length; i++) {
    await inputs[i].type(code[i], {delay: 15}).catch(() => {});
  }
  process.stdout.write('5-Code entered\n');
  await new Promise(r => setTimeout(r, 1000));
  
  // Click any relevant button
  const btns = await page.$$('button');
  for (const btn of btns) {
    try {
      const t = await btn.evaluate(el => el.textContent);
      if (t.includes('Verify') || t.includes('Submit') || t.includes('Authorize') || t.includes('Continue')) {
        await btn.click().catch(() => {});
        process.stdout.write('6-Clicked: ' + t.substring(0,20) + '\n');
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    } catch(e) {}
  }
  
  // Poll for token
  process.stdout.write('7-Polling...\n');
  for (let i = 0; i < 120; i++) {
    try {
      const data = JSON.stringify({ client_id: '178c6fc778ccc68e1d6a', device_code: DCODE, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
      const r = await new Promise((resolve) => {
        const req = http.request({ hostname: 'github.com', path: '/login/oauth/access_token', method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch{resolve(null)}}); });
        req.write(data); req.end();
        req.on('error', () => resolve(null));
      });
      if (r && r.access_token) {
        fs.writeFileSync('/tmp/gh-token.txt', r.access_token);
        process.stdout.write('\n8-TOKEN: ' + r.access_token.substring(0,15) + '...\n');
        break;
      }
      if (r && r.error === 'authorization_pending') process.stdout.write('.');
    } catch(e) {}
    await new Promise(r => setTimeout(r, 5000));
  }
  process.stdout.write('\n9-Done\n');
  
  await browser.close();
})().catch(e => process.stdout.write('\nERR: ' + e.message.substring(0,100) + '\n'));
