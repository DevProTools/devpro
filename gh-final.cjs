const pptr = require('puppeteer-core');
const fs = require('fs');
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
  
  // Get CSRF token from settings page
  await page.goto('https://github.com/settings/tokens', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Try classic token creation via direct POST
  const result = await page.evaluate(async () => {
    const token = document.querySelector('[name="authenticity_token"]');
    const csrf = token ? token.value : '';
    try {
      const res = await fetch('/settings/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          authenticity_token: csrf,
          'token[name]': 'devpro-final',
          'token[scopes][]': 'repo'
        }).toString()
      });
      const text = await res.text();
      return { status: res.status, url: res.url, body: text.substring(0, 500) };
    } catch(e) { return { error: e.message }; }
  });
  
  console.log('2-Result:', JSON.stringify(result));
  
  if (result.body) {
    const match = result.body.match(/ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}/);
    if (match) {
      fs.writeFileSync('/tmp/gh-token.txt', match[0]);
      console.log('3-TOKEN SAVED:', match[0].substring(0, 15) + '...');
    } else if (result.status === 302 || result.status === 200) {
      // Check if redirected to token page (success)
      console.log('3-Redirect or success (status:', result.status, ')');
      if (result.url) console.log('   URL:', result.url);
    }
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
