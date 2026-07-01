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
  await page.goto('https://github.com/settings/personal-access-tokens/new', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 3000));
  
  const elements = await page.evaluate(() => {
    const all = [];
    document.querySelectorAll('input, textarea, button, select').forEach(e => {
      const rect = e.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        all.push({
          tag: e.tagName,
          id: e.id || '',
          type: e.type || '',
          placeholder: e.placeholder || '',
          'aria-label': e.getAttribute('aria-label') || '',
          text: (e.textContent || '').trim().substring(0, 40),
          name: e.getAttribute('name') || ''
        });
      }
    });
    return all.slice(0, 40);
  });
  
  console.log('Visible elements on fine-grained token page:');
  elements.forEach((e, i) => console.log(i + ':', JSON.stringify(e)));
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
