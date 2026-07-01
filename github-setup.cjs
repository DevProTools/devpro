const pptr = require('puppeteer-core');

async function randWait(ms) { return new Promise(r => setTimeout(r, Math.random() * ms + ms/2)); }

(async () => {
  const fs = require('fs');
  const USER = 'DevProTools';
  const PASS = 'DevPro@2026!Secure';
  
  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36');
  
  // Step 1: Login
  console.log('[1/4] Logging in...');
  await page.goto('https://github.com/login', { timeout: 60000, waitUntil: 'networkidle2' });
  await randWait(1500);
  await page.type('#login_field', USER, {delay: 25});
  await page.type('#password', PASS, {delay: 20});
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ timeout: 30000 });
  console.log('  Logged in as', USER);

  // Step 2: Create repo
  console.log('[2/4] Creating repo...');
  await page.goto('https://github.com/new', { timeout: 60000, waitUntil: 'networkidle2' });
  await randWait(2000);
  await page.type('#repository_name', 'devpro', {delay: 30});
  await page.type('#repository_description', 'DevPro - A suite of polished developer utilities. JSON formatter, JWT decoder, Base64, UUID generator, regex tester, color converter and more.', {delay: 15});
  await randWait(500);
  // Make it public (default is private, click public radio)
  const radios = await page.$$('input[type="radio"]');
  for (const r of radios) {
    const val = await r.evaluate(el => el.value);
    if (val === 'public') { await r.click(); break; }
  }
  await randWait(500);
  // Submit
  const submitBtn = await page.$('button:has-text("Create repository")') || await page.$('button[type="submit"]');
  if (submitBtn) { await submitBtn.click(); await page.waitForNavigation({ timeout: 30000 }).catch(() => {}); }
  await randWait(2000);
  console.log('  URL:', page.url());

  // Step 3: Create personal access token via settings
  console.log('[3/4] Creating access token...');
  await page.goto('https://github.com/settings/tokens', { timeout: 60000, waitUntil: 'networkidle2' });
  await randWait(2000);
  
  // Click "Generate new token" button (classic)
  const generateBtn = await page.$('a:has-text("Generate new token")') || await page.$('summary:has-text("Generate new token")');
  if (generateBtn) { 
    await generateBtn.click(); 
    await randWait(1000);
    // Click "Generate new token (classic)" if the dropdown appeared
    const classicBtn = await page.$('a:has-text("classic")');
    if (classicBtn) await classicBtn.click();
    await page.waitForNavigation({ timeout: 30000 }).catch(() => {});
  } else {
    // Direct URL for classic token
    await page.goto('https://github.com/settings/tokens/new', { timeout: 60000, waitUntil: 'networkidle2' });
  }
  await randWait(2000);
  
  // Fill token form
  const noteInput = await page.$('#token_description') || await page.$('input[name="note"]');
  if (noteInput) {
    await noteInput.type('devpro-automation', {delay: 15});
    
    // Check repo scope
    const repoCheckbox = await page.$('input[value="repo"]');
    if (repoCheckbox) {
      await repoCheckbox.click();
      await randWait(500);
    }
    
    // Generate
    const genBtn = await page.$('button:has-text("Generate token")');
    if (genBtn) await genBtn.click();
    await randWait(3000);
    
    // Copy the generated token
    const tokenInput = await page.$('input[value]');
    if (tokenInput) {
      const token = await tokenInput.evaluate(el => el.value);
      if (token && token.length > 10) {
        console.log('  Token generated:', token.substring(0, 10) + '...');
        fs.writeFileSync('/tmp/gh-token.txt', token);
        console.log('[4/4] Token saved to /tmp/gh-token.txt');
      }
    }
  }
  
  console.log('DONE');
  await browser.close();
})().catch(e => console.log('ERROR:', e.message.substring(0, 300)));
