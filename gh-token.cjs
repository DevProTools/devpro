const pptr = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('https://github.com/login', { timeout: 30000, waitUntil: 'load' });
  await page.type('#login_field', 'DevProTools', {delay: 10});
  await page.type('#password', 'DevPro@2026!Secure', {delay: 10});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 15000 });
  console.log('Logged in');

  // Go to tokens page
  await page.goto('https://github.com/settings/tokens', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  // Click "Generate new token" dropdown
  const genBtn = await page.$('summary');
  if (!genBtn) { console.log('No summary btn'); await browser.close(); return; }
  
  const summaryText = await genBtn.evaluate(el => el.textContent);
  if (!summaryText.includes('Generate')) { 
    // Try other approaches to find the generate button
    const allBtns = await page.$$('summary, a, button');
    for (const btn of allBtns) {
      const txt = await btn.evaluate(el => el.textContent);
      if (txt.includes('Generate new token')) {
        await btn.click();
        break;
      }
    }
  } else {
    await genBtn.click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click the classic token link
  const classicLinks = await page.$$('a');
  let found = false;
  for (const link of classicLinks) {
    const txt = await link.evaluate(el => el.textContent);
    const href = await link.evaluate(el => el.href);
    if (txt.includes('classic') || href.includes('tokens/new')) {
      await link.click();
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Direct URL fallback
    await page.goto('https://github.com/settings/tokens/new', { timeout: 30000, waitUntil: 'load' });
  }
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Token page URL:', page.url());
  
  // Fill token form
  const noteInput = await page.$('#token_description');
  if (noteInput) {
    await noteInput.type('devpro-automation', {delay: 10});
    
    // Check repo scope
    const repoCheck = await page.$('input[value="repo"]');
    if (repoCheck) {
      const isChecked = await repoCheck.evaluate(el => el.checked);
      if (!isChecked) await repoCheck.click();
    }
    
    await new Promise(r => setTimeout(r, 500));
    
    // Generate
    const genTokenBtn = await page.$('button');
    if (genTokenBtn) {
      const btnText = await genTokenBtn.evaluate(el => el.textContent);
      if (btnText.includes('Generate token')) await genTokenBtn.click();
    }
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Extract token from page
    const token = await page.evaluate(() => {
      const match = document.body.innerText.match(/ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}/);
      return match ? match[0] : null;
    });
    
    if (token) {
      fs.writeFileSync('/tmp/gh-token.txt', token);
      console.log('TOKEN:', token.substring(0, 15) + '...');
      console.log('Saved to /tmp/gh-token.txt');
    } else {
      console.log('No token found in page text');
      // Dump page text for debugging
      const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      console.log('PAGE:', text.replace(/\n/g, ' | ').substring(0, 500));
    }
  } else {
    console.log('No token_description input - page may be fine-grained tokens');
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(i => i.id || i.name || i.type).join(', ');
    });
    console.log('Inputs:', inputs);
  }
  
  await browser.close();
})().catch(e => console.log('ERROR:', e.message.substring(0, 300)));
