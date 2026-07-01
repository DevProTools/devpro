const pptr = require('puppeteer-core');
const fs = require('fs');
(async () => {
  const pubkey = fs.readFileSync('/tmp/devpro-ssh.pub', 'utf-8').trim();
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
  await page.goto('https://github.com/settings/ssh/new', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  // Fill form with correct IDs
  const titleInput = await page.$('#ssh_key_title');
  const keyInput = await page.$('#ssh_key_key');
  if (titleInput) await titleInput.type('DevPro Deploy Key', {delay: 10});
  if (keyInput) { await keyInput.type(pubkey, {delay: 3}); console.log('Key pasted'); }
  await new Promise(r => setTimeout(r, 500));
  const addBtn = await page.$('button[type="submit"]');
  if (addBtn) {
    const text = await addBtn.evaluate(el => el.textContent);
    if (text.includes('Add SSH key')) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('Result:', page.url());
      if (page.url().includes('keys')) console.log('SSH KEY ADDED!');
    }
  }
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 300)));
