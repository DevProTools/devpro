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
  
  // Fill name
  await page.evaluate(() => {
    const el = document.querySelector('#user_programmatic_access_name');
    if (el) { el.value = 'devpro-push-v2'; el.dispatchEvent(new Event('input', {bubbles:true})); }
  });
  
  // All repos
  await page.evaluate(() => {
    const el = document.querySelector('#install_target_all');
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Add permissions
  const addPermBtn = await page.$('[aria-label="Add permissions"]');
  if (addPermBtn) await addPermBtn.click();
  await new Promise(r => setTimeout(r, 1500));
  
  // Type "Contents" in search
  const searchInput = await page.$('input[type="text"]');
  if (searchInput) {
    const placeholder = await searchInput.evaluate(el => el.placeholder);
    if (placeholder === 'Search' || placeholder.includes('filter')) {
      await searchInput.type('Contents', {delay: 20});
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  // Find and click "Contents" row
  const contentsBtn = await page.$('[id*="contents"]') || 
                       await page.$('[aria-label*="Content"]') ||
                       await page.$('button:has-text("Contents")');
  if (contentsBtn) {
    await contentsBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('2-Clicked Contents');
  } else {
    console.log('2-Contents not found');
  }
  
  // Try to set to Write
  const writeBtn = await page.$('button:has-text("Write")') || 
                   await page.$('[value="write"]') ||
                   await page.$('[data-value="write"]');
  if (writeBtn) {
    await writeBtn.click();
    await new Promise(r => setTimeout(r, 500));
    console.log('3-Set to Write');
  }
  
  // Generate token
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.trim() === 'Generate token') {
      await btn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('4-URL:', page.url());
      break;
    }
  }
  
  // Extract token
  const token = await page.evaluate(() => {
    const m = document.body.innerText.match(/github_pat_[a-zA-Z0-9_]{82}/);
    return m ? m[0] : null;
  });
  
  if (token) { fs.writeFileSync('/tmp/gh-token.txt', token); console.log('5-TOKEN:', token.substring(0,15)+'...'); }
  else {
    console.log('5-No token');
    const t = await page.evaluate(() => document.body.innerText.substring(0, 600));
    console.log('Page:', t.replace(/\n/g,' | ').substring(0, 300));
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
