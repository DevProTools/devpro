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
  await page.goto('https://github.com/new', { timeout: 60000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('New repo loaded');
  const exists = await page.evaluate(() => !!document.querySelector('#repository-name-input'));
  if (!exists) { console.log('Input not found'); await browser.close(); return; }
  await page.type('#repository-name-input', 'devpro', {delay: 10});
  await new Promise(r => setTimeout(r, 500));
  const pubRadio = await page.$('#repo-visibility-radio-public');
  if (pubRadio) {
    const checked = await pubRadio.evaluate(el => el.checked);
    if (!checked) await pubRadio.click();
  }
  await new Promise(r => setTimeout(r, 300));
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.trim() === 'Create repository') {
      await btn.click();
      await new Promise(r => setTimeout(r, 5000));
      console.log('URL:', page.url());
      if (page.url().includes('devpro')) console.log('REPO CREATED!');
      break;
    }
  }
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 300)));
