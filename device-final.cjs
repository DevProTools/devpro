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
  
  await page.goto('https://github.com/login/device?skip_account_picker=true', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('2-URL:', page.url());
  
  // Type code character by character into each input
  const code = '283A-F847';
  const inputs = await page.$$('input[type="text"]');
  console.log('3-Inputs:', inputs.length);
  
  if (inputs.length === 9) {
    for (let i = 0; i < code.length && i < inputs.length; i++) {
      await inputs[i].type(code[i], {delay: 20});
    }
    console.log('4-Code entered char by char');
    await new Promise(r => setTimeout(r, 1000));
    
    // Submit
    const btns = await page.$$('button');
    for (const btn of btns) {
      const t = await btn.evaluate(el => el.textContent);
      if (t.includes('Verify') || t.includes('Submit') || t.includes('Continue') || t.includes('Authorize')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 3000));
        console.log('5-Clicked:', t.substring(0,30));
        break;
      }
    }
  } else if (inputs.length > 0) {
    // Single input
    for (let i = 0; i < code.length && i < inputs.length; i++) {
      await inputs[i].type(code, {delay: 10});
    }
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Try to click Authorize
  const btns2 = await page.$$('button');
  for (const btn of btns2) {
    const t = await btn.evaluate(el => el.textContent);
    if (t.includes('Authorize') || t.includes('authorize')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('6-Authorized!');
      break;
    }
  }
  
  // Poll for token (up to 10 minutes)
  const poll = () => new Promise((resolve) => {
    const data = JSON.stringify({ client_id: '178c6fc778ccc68e1d6a', device_code: CODE, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
    const req = http.request({ hostname: 'github.com', path: '/login/oauth/access_token', method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': data.length } }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch{resolve(null)}}); });
    req.write(data); req.end();
  });
  
  console.log('7-Polling...');
  for (let i = 0; i < 120; i++) {
    const r = await poll();
    if (r && r.access_token) {
      fs.writeFileSync('/tmp/gh-token.txt', r.access_token);
      console.log('8-TOKEN:', r.access_token.substring(0,15)+'...');
      break;
    }
    if (r && r.error === 'authorization_pending') process.stdout.write('.');
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log('\n9-Done');
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
