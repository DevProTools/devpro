const pptr = require('puppeteer-core');
const http = require('http');

const DEVICE_CODE = '7c0fff48d6808e18de04bc60e65bc7feac2c10eb';
const USER_CODE = '283A-F847';

(async () => {
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  // Login first
  await page.goto('https://github.com/login', { timeout: 30000 });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 15000 });
  console.log('1-Logged in');
  
  // Navigate to device activation
  await page.goto('https://github.com/login/device', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('2-Device page loaded, URL:', page.url());
  
  // Find user code input
  const inputs = await page.$$('input');
  console.log('Inputs on page:', inputs.length);
  
  // Try to enter the code
  const codeInput = await page.$('#user_code') || await page.$('input[type="text"]');
  if (codeInput) {
    await codeInput.type(USER_CODE, {delay: 15});
    await new Promise(r => setTimeout(r, 500));
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('3-After submit, URL:', page.url());
      
      // Check for Authorize button
      const authorizeBtn = await page.$('button:has-text("Authorize")') || 
                           await page.$('button:has-text("authorize")');
      if (authorizeBtn) {
        await authorizeBtn.click();
        await new Promise(r => setTimeout(r, 3000));
        console.log('4-Authorized, URL:', page.url());
      }
    }
  }
  
  // Now poll for token
  console.log('5-Polling for token...');
  const poll = () => new Promise((resolve, reject) => {
    const data = JSON.stringify({
      client_id: '178c6fc778ccc68e1d6a',
      device_code: DEVICE_CODE,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    });
    
    const req = http.request({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': data.length }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
  
  let token = null;
  for (let i = 0; i < 60; i++) {
    const result = await poll();
    if (result && result.access_token) {
      token = result.access_token;
      console.log('6-TOKEN:', token.substring(0, 15) + '...');
      const fs = require('fs');
      fs.writeFileSync('/tmp/gh-token.txt', token);
      break;
    }
    if (result && result.error === 'authorization_pending') {
      process.stdout.write('.');
    } else if (result) {
      console.log('  Status:', result.error || JSON.stringify(result));
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  
  if (token) console.log('7-Token saved to /tmp/gh-token.txt');
  else console.log('7-Token retrieval failed');
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
