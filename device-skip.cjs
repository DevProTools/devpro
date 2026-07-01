const pptr = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const CODE = '7c0fff48d6808e18de04bc60e65bc7feac2c10eb';

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
  
  // Try with skip_account_picker
  await page.goto('https://github.com/login/device?skip_account_picker=true', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('2-URL:', page.url());
  
  // Try to find code input
  const body = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('3-Text:', body.replace(/\n/g,' | ').substring(0, 200));
  
  // Get text inputs
  const textInputs = await page.$$('input[type="text"]');
  console.log('4-Text inputs:', textInputs.length);
  
  if (textInputs.length > 0) {
    await textInputs[0].type('283A-F847', {delay: 10});
    console.log('5-Typed code');
    await new Promise(r => setTimeout(r, 500));
    
    // Find submit button
    const btns = await page.$$('button');
    for (const btn of btns) {
      const t = await btn.evaluate(el => el.textContent);
      if (t.includes('Verify') || t.includes('Submit') || t.includes('Continue')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 3000));
        console.log('6-Submitted, URL:', page.url());
        break;
      }
    }
    
    // Authorize
    const btns2 = await page.$$('button');
    for (const btn of btns2) {
      const t = await btn.evaluate(el => el.textContent);
      if (t.includes('Authorize') || t.includes('authorize')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('7-Authorized!');
        break;
      }
    }
  }
  
  // Poll for token
  const poll = () => new Promise((resolve) => {
    const data = JSON.stringify({ client_id: '178c6fc778ccc68e1d6a', device_code: CODE, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
    const req = http.request({ hostname: 'github.com', path: '/login/oauth/access_token', method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': data.length } }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch{resolve(null)}}); });
    req.write(data); req.end();
  });
  
  for (let i = 0; i < 60; i++) {
    const r = await poll();
    if (r && r.access_token) {
      fs.writeFileSync('/tmp/gh-token.txt', r.access_token);
      console.log('8-TOKEN:', r.access_token.substring(0,15)+'...');
      break;
    }
    if (r && r.error === 'authorization_pending') process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log('\n9-End');
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
