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
  await new Promise(r => setTimeout(r, 2000));
  
  // Fill token name
  await page.evaluate(() => {
    const el = document.querySelector('#user_programmatic_access_name');
    if (el) { el.value = 'devpro-push-v2'; el.dispatchEvent(new Event('input', {bubbles:true})); }
  });
  
  // Select "All repositories"
  await page.evaluate(() => {
    const el = document.querySelector('#install_target_all');
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Click "Add permissions" button
  const addPermBtn = await page.$('[aria-label="Add permissions"]');
  if (addPermBtn) {
    console.log('Found Add permissions button');
    await addPermBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    
    // Check for dialog/content changes
    const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('After click:', text.replace(/\n/g, ' | ').substring(0, 500));
  } else {
    console.log('No Add permissions button');
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
