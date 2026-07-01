const pptr = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const DEVICE_CODE = '7c0fff48d6808e18de04bc60e65bc7feac2c10eb';

(async () => {
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  // Login
  await page.goto('https://github.com/login', { timeout: 30000 });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 15000 });
  console.log('1-Logged in');
  
  // Device activation
  await page.goto('https://github.com/login/device', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('2-URL:', page.url());
  
  // Handle select_account
  if (page.url().includes('select_account')) {
    const allBtns = await page.$$('button');
    for (const btn of allBtns) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('DevProTools')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('3-Account selected');
        break;
      }
    }
  }
  
  // Enter user code
  const inputs = await page.$$('input');
  const codeInput = inputs.find(async (el) => {
    const type = await el.evaluate(e => e.type);
    return type === 'text';
  });
  
  if (inputs.length > 0) {
    // Find the text input for user code
    let found = false;
    for (const input of inputs) {
      const type = await input.evaluate(el => el.type);
      if (type === 'text') {
        await input.type('283A-F847', {delay: 10});
        found = true;
        break;
      }
    }
    
    if (found) {
      await new Promise(r => setTimeout(r, 500));
      
      // Find submit button
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && (text.includes('Verify') || text.includes('Submit') || text.includes('Continue'))) {
          await btn.click();
          await new Promise(r => setTimeout(r, 3000));
          console.log('4-Code submitted, URL:', page.url());
          break;
        }
      }
    }
  }
  
  // Authorize
  const allBtns2 = await page.$$('button');
  for (const btn of allBtns2) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && (text.includes('Authorize') || text.includes('authorize') || text.includes('Approve'))) {
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('5-Authorized');
      break;
    }
  }
  
  // Poll for token
  console.log('6-Polling for token...');
  const poll = () => new Promise((resolve) => {
    const data = JSON.stringify({ client_id: '178c6fc778ccc68e1d6a', device_code: DEVICE_CODE, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
    const req = http.request({ hostname: 'github.com', path: '/login/oauth/access_token', method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': data.length } }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch{resolve(null)}}); });
    req.write(data); req.end();
  });
  
  for (let i = 0; i < 180; i++) {
    const r = await poll();
    if (r && r.access_token) { 
      fs.writeFileSync('/tmp/gh-token.txt', r.access_token);
      console.log('7-TOKEN:', r.access_token.substring(0,15)+'...');
      break;
    }
    if (r && r.error === 'authorization_pending') process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log('\n8-Done');
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
