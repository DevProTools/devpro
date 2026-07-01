const puppeteer = require('puppeteer-core');
const fs = require('fs');

const USER = 'devpro_hq';
const PASS = Array.from({length:16},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');

(async () => {
  console.log('USER:', USER);
  console.log('PASS:', PASS);

  const b = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const p = await b.newPage();
  await p.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  await p.goto('https://news.ycombinator.com/login', { timeout: 30000, waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Fill the create account form (second form on page)
  const inputs = await p.$$('input');
  const acctInput = inputs[3]; // 4th input (0-indexed): creating form's acct
  const pwInput = inputs[4];   // 5th input: creating form's pw

  await acctInput.type(USER, {delay: 30});
  await pwInput.type(PASS, {delay: 20});
  await new Promise(r => setTimeout(r, 500));

  // Click create account button
  const btns = await p.$$('input[type="submit"]');
  for (const btn of btns) {
    const val = await btn.evaluate(el => el.value);
    if (val === 'create account') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000));

  const url = p.url();
  const title = await p.title();
  console.log('URL:', url);
  console.log('Title:', title);

  if (url.includes('news.ycombinator.com') && !url.includes('login')) {
    console.log('REGISTRATION SUCCESSFUL!');
    fs.writeFileSync('/tmp/hn-creds.json', JSON.stringify({username:USER,password:PASS,url:url},null,2));
  } else {
    console.log('Registration may have failed');
  }

  await b.close();
})().catch(e => console.log('ERROR:', e.message));
