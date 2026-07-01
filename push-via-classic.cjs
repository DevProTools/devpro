const pptr = require('puppeteer-core');
const fs = require('fs');
(async () => {
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  // Login
  await page.goto('https://github.com/login', { timeout: 60000 });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 60000 });
  console.log('Logged in');
  
  // Step 1: First create a README file to initialize the repo
  await page.goto('https://github.com/DevProTools/devpro', { timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  console.log('Repo page loaded');
  
  // Look for "Add a README" button or "Add file" dropdown
  const btns = await page.evaluate(() => {
    const all = [];
    document.querySelectorAll('a, button, summary, [role="button"]').forEach(e => {
      const text = (e.textContent || '').trim();
      if (text && text.length < 50) {
        all.push({ tag: e.tagName, text, href: e.href || '', id: e.id || '' });
      }
    });
    return all;
  });
  
  console.log('Interactive elements:');
  btns.forEach(b => {
    if (b.text.toLowerCase().includes('file') || b.text.toLowerCase().includes('readme') || b.text.toLowerCase().includes('add')) {
      console.log('  -', b.text.substring(0, 40));
    }
  });
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
