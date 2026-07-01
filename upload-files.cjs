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
  console.log('Logged in');
  
  // Go to upload page
  await page.goto('https://github.com/DevProTools/devpro/upload/main', { timeout: 30000, waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Upload page URL:', page.url());
  console.log('Title:', await page.title());
  
  // Check for file input
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    console.log('File input found!');
  } else {
    // Create a file input and attach to page
    console.log('No file input, creating one...');
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.id = '__upload';
      input.multiple = true;
      document.body.appendChild(input);
    });
    
    // Find and set the file chooser
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({ timeout: 3000 }).catch(() => null),
      page.click('#__upload')
    ]);
    
    if (fileChooser) {
      await fileChooser.accept(['/Users/ouze/Desktop/DevPro/package.json']);
      console.log('File selected');
      await new Promise(r => setTimeout(r, 3000));
      
      const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('After upload:', text.replace(/\n/g, ' | ').substring(0, 200));
    }
  }
  
  await browser.close();
})().catch(e => console.log('ERR:', e.message.substring(0, 200)));
