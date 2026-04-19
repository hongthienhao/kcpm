const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Bắt tất cả console.log của trình duyệt
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  // Bắt tất cả request network
  page.on('response', async (response) => {
    if (response.url().includes('/auth/login')) {
      console.log('API RESPONSE STATUS:', response.status());
      try {
        console.log('API RESPONSE BODY:', await response.json());
      } catch(e) {}
    }
  });

  console.log('GOTO login...');
  await page.goto('http://localhost:5173/login');

  console.log('Fill form...');
  await page.fill('#email', 'evowner@gmail.com');
  await page.fill('#password', 'SaiPass123!');
  
  console.log('Click submit...');
  await page.click('button[type="submit"]');

  console.log('Waiting 3s...');
  await page.waitForTimeout(3000);

  console.log('Grabbing body HTML...');
  const html = await page.innerHTML('.cardBody');
  console.log('HTML CARD BODY:', html);

  await browser.close();
})();
