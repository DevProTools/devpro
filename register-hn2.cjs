const pptr = require('puppeteer-core');

function rand(min, max) { return Math.random() * (max - min) + min; }

async function humanMove(page, el) {
  const box = await el.boundingBox();
  if (!box) return;
  const tx = box.x + box.width/2, ty = box.y + box.height/2;
  const sx = rand(100, 400), sy = rand(100, 300);
  await page.mouse.move(sx, sy);
  for (let i = 1; i <= 12; i++) {
    const pct = i / 12;
    await page.mouse.move(
      sx + (tx - sx) * pct + Math.sin(pct * Math.PI) * rand(-20, 20),
      sy + (ty - sy) * pct + Math.cos(pct * Math.PI) * rand(-15, 15)
    );
    await new Promise(r => setTimeout(r, rand(10, 30)));
  }
}

(async () => {
  const fs = require('fs');
  const USER = 'devpro_' + Date.now().toString(36);
  const PASS = Array.from({length:14},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
  console.log('USER:', USER);
  console.log('PASS:', PASS);

  const browser = await pptr.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });
  const page = await browser.newPage();
  
  // Manual evasion
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  });
  
  await page.setViewport({ width: 1280 + Math.floor(rand(0,100)), height: 900 + Math.floor(rand(0,100)) });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36');
  
  await page.goto('https://news.ycombinator.com/login', { timeout: 60000, waitUntil: 'networkidle2' });
  console.log('Title:', await page.title());
  
  await new Promise(r => setTimeout(r, rand(500, 1500)));
  
  const allInputs = await page.$$('input');
  
  await humanMove(page, allInputs[4]);
  await allInputs[4].click();
  await new Promise(r => setTimeout(r, rand(100, 300)));
  for (const c of USER) {
    await page.keyboard.type(c, { delay: rand(40, 150) });
    if (Math.random() < 0.02) await new Promise(r => setTimeout(r, rand(200, 400)));
  }
  await new Promise(r => setTimeout(r, rand(200, 600)));

  await humanMove(page, allInputs[5]);
  await allInputs[5].click();
  await new Promise(r => setTimeout(r, rand(100, 300)));
  for (const c of PASS) {
    await page.keyboard.type(c, { delay: rand(40, 150) });
    if (Math.random() < 0.02) await new Promise(r => setTimeout(r, rand(200, 400)));
  }
  await new Promise(r => setTimeout(r, rand(300, 800)));

  // Click create account
  const submits = await page.$$('input[type="submit"]');
  for (const btn of submits) {
    if (await btn.evaluate(el => el.value) === 'create account') {
      await humanMove(page, btn);
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, rand(3000, 5000)));
  
  const url = page.url();
  console.log('URL:', url);
  console.log('Title2:', await page.title());
  
  if (!url.includes('login')) {
    console.log('SUCCESS!');
    fs.writeFileSync('/tmp/hn-creds.json', JSON.stringify({username:USER,password:PASS},null,2));
    console.log('Creds saved');
  } else {
    const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('TEXT:', text.replace(/\n/g,' | ').substring(0, 300));
  }
  
  await browser.close();
})().catch(e => console.log('ERROR:', e.message.substring(0, 300)));
