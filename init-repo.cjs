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
  console.log('Logged in');
  
  // Click "README" to create initial file
  await page.goto('https://github.com/DevProTools/devpro', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Find and click "README" link
  const links = await page.$$('a');
  for (const link of links) {
    const text = await link.evaluate(el => el.textContent);
    if (text && text.trim() === 'README') {
      await link.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('Clicked README, URL:', page.url());
      break;
    }
  }
  
  // Now on the create/edit file page - commit the default README
  const commitBtn = await page.$('button:has-text("Commit new file")') || 
                    await page.$('button:has-text("Commit changes")');
  if (commitBtn) {
    await commitBtn.click();
    await new Promise(r => setTimeout(r, 5000));
    console.log('Committed README, URL:', page.url());
    console.log('Repo initialized!');
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
