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
  console.log('1-Logged in');
  
  // Try direct fine-grained token creation URL
  await page.goto('https://github.com/settings/personal-access-tokens/new', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 3000));
  console.log('2-Token page:', page.url());
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 400));
  console.log('3-Text:', text.replace(/\n/g, ' | ').substring(0, 200));
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
