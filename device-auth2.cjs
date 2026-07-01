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
  
  await page.goto('https://github.com/login', { timeout: 30000 });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 15000 });
  console.log('1-Logged in');
  
  await page.goto('https://github.com/login/device', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('2-URL:', page.url());
  
  // Handle "select_account" page if present
  let url = page.url();
  if (url.includes('select_account')) {
    console.log('3-Select account page');
    // Click on DevProTools
    const accounts = await page.$$('button, a');
    for (const a of accounts) {
      const text = await a.evaluate(el => el.textContent);
      if (text && text.includes('DevProTools')) {
        await a.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('4-Selected account, URL:', page.url());
        break;
      }
    }
  }
  
  // Enter user code
  const codeInput = await page.$('#user_code') || await page.$('input[type="text"]');
  if (codeInput) {
    await codeInput.type('283A-F847', {delay: 15});
    await new Promise(r => setTimeout(r, 500));
    
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('5-After submit, URL:', page.url());
    }
  }
  
  // Click Authorize if present
  const authBtn = await page.$('button:has-text("Authorize")') || 
                 await page.$('button:has-text("authorize")') ||
                 await page.$('button:has-text("Approve")');
  if (authBtn) {
    await authBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('6-Authorized');
  }
  
  // Poll for token
  console.log('7-Polling for token...');
  
  const poll = () => new Promise((resolve, reject) => {
    const data = JSON.stringify({
      client_id: '178c6fc778ccc68e1d6a',
      device_code: DEVICE_CODE,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    });
    const req = http.request({
      hostname: 'github.com', path: '/login/oauth/access_token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': data.length }
    }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch{resolve(null)}}); });
    req.on('error', reject); req.write(data); req.end();
  });
  
  let token = null;
  for (let i = 0; i < 120; i++) {
    const result = await poll();
    if (result && result.access_token) {
      token = result.access_token;
      console.log('8-TOKEN:', token.substring(0, 15) + '...');
      fs.writeFileSync('/tmp/gh-token.txt', token);
      break;
    }
    if (result && result.error === 'authorization_pending') process.stdout.write('.');
    else if (result) console.log('Result:', result.error || JSON.stringify(result));
    await new Promise(r => setTimeout(r, 5000));
  }
  
  if (token) console.log('\n9-Token saved!');
  else console.log('\n9-Failed');
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
