const pptr = require('puppeteer-core');
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

  await page.goto('https://github.com/DevProTools/devpro/upload/main', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check if there's a branch selector
  const hasBranchSelector = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Select a branch') || text.includes('branch');
  });
  console.log('Has branch selector:', hasBranchSelector);
  
  // Get all interactive elements
  const elements = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[role="button"], summary, button, select').forEach(el => {
      results.push({
        text: (el.textContent || '').trim().substring(0, 50),
        role: el.getAttribute('role') || '',
        tag: el.tagName
      });
    });
    return results;
  });
  console.log('Interactive elements:', JSON.stringify(elements).substring(0, 800));
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
