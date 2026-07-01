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
  console.log('SSH keys page:', page.url());
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('Page:', text.replace(/\n/g, ' | ').substring(0, 200));
  
  // Find key input and title input
  const titleInput = await page.$('#key_title') || await page.$('input[name="public_key[title]"]');
  const keyInput = await page.$('#key_key') || await page.$('textarea[name="public_key[key]"]');
  
  if (keyInput) {
    if (titleInput) await titleInput.type('DevPro Deploy Key', {delay: 10});
    await keyInput.type(pubkey, {delay: 5});
    await new Promise(r => setTimeout(r, 500));
    
    // Add SSH key
    const addBtn = await page.$('button:has-text("Add SSH key")') || await page.$('button[type="submit"]');
    if (addBtn) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('Result URL:', page.url());
      if (page.url().includes('keys')) console.log('SSH KEY ADDED!');
    }
  } else {
    console.log('No key input found');
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 300)));
