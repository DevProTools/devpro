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

  // First, go to create new file page to ensure branch exists
  await page.goto('https://github.com/DevProTools/devpro/new/main', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('New file page URL:', page.url());
  
  // If redirected to repo, the branch might not exist yet  
  // Try uploading to default branch
  const cookies = await page.cookies();
  const sessionCookie = cookies.find(c => c.name === 'user_session');
  
  if (sessionCookie) {
    console.log('Session cookie found:', sessionCookie.value.substring(0, 10) + '...');
    
    // Now try to upload files via the upload endpoint  
    // First read the file
    const fileContent = fs.readFileSync('/Users/ouze/Desktop/DevPro/package.json');
    
    // Use the browser's fetch to upload the file  
    const result = await page.evaluate(async () => {
      // Create FormData and upload
      const form = new FormData();
      const blob = new Blob(['{"name":"test"}'], {type: 'application/json'});
      form.append('file[]', blob, 'package.json');
      
      try {
        const res = await fetch('/DevProTools/devpro/upload/main', {
          method: 'POST',
          body: form
        });
        return { status: res.status, url: res.url };
      } catch(e) { return { error: e.message }; }
    });
    
    console.log('Upload result:', JSON.stringify(result));
  }
  
  // Alternative: Create each file via the web create-file API 
  // First check if "Add file" button exists on repo page
  await page.goto('https://github.com/DevProTools/devpro', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  const addFileBtns = await page.evaluate(() => {
    const allElements = [];
    document.querySelectorAll('a, button, summary').forEach(el => {
      const text = (el.textContent || '').trim();
      if (text && text.toLowerCase().includes('add') || text.toLowerCase().includes('upload') || text.toLowerCase().includes('file')) {
        allElements.push(text.substring(0, 50));
      }
    });
    // Also get all buttons
    const allBtns = Array.from(document.querySelectorAll('a')).map(a => a.textContent.trim().substring(0, 40)).filter(Boolean);
    return { addRelated: allElements, allLinks: allBtns.slice(0, 20) };
  });
  
  console.log('Add-related buttons:', JSON.stringify(addFileBtns.addRelated));
  console.log('Page links:', JSON.stringify(addFileBtns.allLinks));
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
