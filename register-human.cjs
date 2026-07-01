const pe = require('puppeteer-extra');
const st = require('puppeteer-extra-plugin-stealth');
pe.use(st());

function rand(min, max) { return Math.random() * (max - min) + min; }

async function humanMove(page, el) {
  const box = await el.boundingBox();
  if (!box) return;
  const tx = box.x + box.width/2, ty = box.y + box.height/2;
  const sx = rand(100, 400), sy = rand(100, 300);
  const steps = Math.floor(rand(8, 18));
  await page.mouse.move(sx, sy);
  for (let i = 1; i <= steps; i++) {
    const pct = i / steps;
    await page.mouse.move(
      sx + (tx - sx) * pct + Math.sin(pct * Math.PI) * rand(-20, 20),
      sy + (ty - sy) * pct + Math.cos(pct * Math.PI) * rand(-15, 15)
    );
    await new Promise(r => setTimeout(r, rand(8, 25)));
  }
}

async function humanType(page, text) {
  for (const char of text) {
    await page.keyboard.type(char, { delay: rand(40, 150) });
    if (Math.random() < 0.02) await new Promise(r => setTimeout(r, rand(200, 500)));
  }
}

(async () => {
  const fs = require('fs');
  const USER = 'devpro_' + Date.now().toString(36);
  const PASS = Array.from({length:14},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
  console.log('USER:', USER);
  console.log('PASS:', PASS);

  const browser = await pe.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280 + Math.floor(rand(0,100)), height: 900 + Math.floor(rand(0,100)) });
  await page.goto('https://news.ycombinator.com/login', { timeout: 60000, waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, rand(500, 1500)));

  // Find inputs by name (there are 2 forms, we use the create form: 2nd acct + pw)
  const allInputs = await page.$$('input');
  // input[3] = creating (hidden), input[4] = acct (create), input[5] = pw (create), input[6] = submit (create)
  
  // Click and type username (4th text input = create acct)
  await humanMove(page, allInputs[4]);
  await allInputs[4].click();
  await new Promise(r => setTimeout(r, rand(100, 300)));
  await humanType(page, USER);
  await new Promise(r => setTimeout(r, rand(200, 600)));

  // Click and type password (5th input = create pw)
  await humanMove(page, allInputs[5]);
  await allInputs[5].click();
  await new Promise(r => setTimeout(r, rand(100, 300)));
  await humanType(page, PASS);
  await new Promise(r => setTimeout(r, rand(300, 800)));

  // Click create account button
  const submits = await page.$$('input[type="submit"]');
  for (const btn of submits) {
    const val = await btn.evaluate(el => el.value);
    if (val === 'create account') {
      await humanMove(page, btn);
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, rand(2000, 4000)));

  const url = page.url();
  console.log('URL:', url);
  console.log('Title:', await page.title());

  if (!url.includes('login')) {
    console.log('SUCCESS!');
    fs.writeFileSync('/tmp/hn-creds.json', JSON.stringify({username:USER,password:PASS},null,2));
  } else {
    const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('TEXT:', text.replace(/\n/g,' | ').substring(0, 300));
  }

  await browser.close();
})().catch(e => console.log('ERROR:', e.message.substring(0, 300)));
