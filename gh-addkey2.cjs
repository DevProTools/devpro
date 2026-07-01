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
  console.log('1-Logged in');
  
  await page.goto('https://github.com/settings/ssh/new', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Fill title
  await page.evaluate(() => {
    const el = document.querySelector('#ssh_key_title');
    if (el) el.value = 'DevPro Deploy Key';
  });
  
  // Fill key
  await page.evaluate((key) => {
    const el = document.querySelector('#ssh_key_key');
    if (el) {
      el.value = key;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, pubkey);
  
  await new Promise(r => setTimeout(r, 1000));
  console.log('2-Form filled');
  
  // Click Add SSH key button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.trim() === 'Add SSH key') {
      console.log('3-Found Add button, clicking...');
      await btn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('4-Result URL:', page.url());
      break;
    }
  }
  
  await browser.close();
  console.log('5-Done');
})().catch(e => console.log('ERR:', e.message.substring(0, 300)));
