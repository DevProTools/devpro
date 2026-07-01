const pptr = require('puppeteer-core');
const fs = require('fs');
(async () => {
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('https://github.com/login', { timeout: 60000, waitUntil: 'load' });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 60000 });
  console.log('Logged in');
  
  await page.goto('https://github.com/settings/personal-access-tokens/new', { timeout: 60000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Use page.evaluate to directly call the API (bypass UI)
  const result = await page.evaluate(async () => {
    const token = document.querySelector('[name="authenticity_token"]');
    const csrf = token ? token.value : '';
    
    try {
      const res = await fetch('/settings/personal-access-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrf
        },
        body: JSON.stringify({
          name: 'devpro-push-v3',
          permissions: { contents: 'write' },
          repository_ids: '*'  // all repos
        })
      });
      const data = await res.text();
      return { status: res.status, data: data.substring(0, 500) };
    } catch(e) { return { error: e.message }; }
  });
  
  console.log('API Result:', JSON.stringify(result));
  
  if (result.data) {
    const match = result.data.match(/github_pat_[a-zA-Z0-9_]{82}/);
    if (match) {
      fs.writeFileSync('/tmp/gh-token.txt', match[0]);
      console.log('TOKEN:', match[0].substring(0, 15) + '...');
    }
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
