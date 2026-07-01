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
  
  await page.goto('https://github.com/settings/personal-access-tokens/new', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Fill token name
  await page.evaluate(() => {
    const el = document.querySelector('#user_programmatic_access_name');
    if (el) { el.value = 'devpro-git-push'; el.dispatchEvent(new Event('input', {bubbles:true})); }
  });
  
  // Select "All repositories"
  await page.evaluate(() => {
    const el = document.querySelector('#install_target_all');
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Generate token
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.trim() === 'Generate token') {
      await btn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('2-Generated, page URL:', page.url());
      break;
    }
  }
  
  // Extract token from page
  const token = await page.evaluate(() => {
    const match = document.body.innerText.match(/github_pat_[a-zA-Z0-9_]{82}/);
    return match ? match[0] : null;
  });
  
  if (token) {
    fs.writeFileSync('/tmp/gh-token.txt', token);
    console.log('3-TOKEN:', token.substring(0, 15) + '...');
  } else {
    console.log('3-No token found');
    const text = await page.evaluate(() => document.body.innerText.substring(0, 800));
    console.log('Page:', text.replace(/\n/g, ' | ').substring(0, 500));
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
