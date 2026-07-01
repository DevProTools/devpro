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
  console.log('Logged in');
  
  // Use GitHub Contents API via fetch from browser page (uses session cookies)
  const content = fs.readFileSync('/Users/ouze/Desktop/DevPro/package.json', 'utf-8');
  const base64 = Buffer.from(content).toString('base64');
  
  const result = await page.evaluate(async (b64content) => {
    try {
      const res = await fetch('https://api.github.com/repos/DevProTools/devpro/contents/package.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: 'Add package.json',
          content: b64content,
          branch: 'main'
        })
      });
      return { status: res.status, text: await res.text().then(t => t.substring(0, 200)) };
    } catch(e) { return { error: e.message }; }
  }, base64);
  
  console.log('API Result:', JSON.stringify(result));
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
