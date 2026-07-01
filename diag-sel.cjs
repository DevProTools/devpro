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
  await page.goto('https://github.com/login/device', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  const interactives = await page.evaluate(() => {
    const all = [];
    document.querySelectorAll('button, a, [role="button"], summary, label').forEach(el => {
      const text = (el.textContent || '').trim().substring(0, 60);
      if (text) {
        all.push({ tag: el.tagName, text, href: el.href || '', type: el.getAttribute('type') || '' });
      }
    });
    return all;
  });
  console.log('Interactive elements:');
  interactives.forEach((e, i) => {
    if (e.text.includes('DevPro') || e.text.includes('account') || e.text.includes('Account')) {
      console.log(i + ':', JSON.stringify(e));
    }
  });
  console.log('---');
  interactives.forEach((e, i) => {
    if (e.tag === 'BUTTON' && e.text.length > 0) {
      console.log(i + ':', JSON.stringify(e));
    }
  });
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
