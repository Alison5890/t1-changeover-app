import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

const BASE = 'https://alison5890.github.io/t1-changeover-app/';
const OUT_DIR = './demo-video';

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function typeSlowly(locator, text, delay = 80) {
  await locator.click();
  await locator.clear();
  for (const ch of text) {
    await locator.pressSequentially(ch);
    await sleep(delay);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 40 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },   // iPhone 14 size — looks great for demo
    recordVideo: { dir: OUT_DIR, size: { width: 390, height: 844 } },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // ── 1. DASHBOARD ─────────────────────────────────────────────────────────
  console.log('📊 Dashboard...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sleep(3000);  // let seed data load and render

  // Switch to Line 10 then back to Line 9
  await page.getByRole('button', { name: 'Line 10' }).click();
  await sleep(1500);
  await page.getByRole('button', { name: 'Line 9' }).click();
  await sleep(2000);

  // Scroll down to see all category cards
  await page.evaluate(() => window.scrollBy(0, 300));
  await sleep(1500);
  await page.evaluate(() => window.scrollBy(0, 300));
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);

  // ── 2. KITTING ──────────────────────────────────────────────────────────
  console.log('📦 Kitting...');
  await page.getByRole('link', { name: /Kitting/i }).click();
  await sleep(2000);

  // Expand first workstation
  const firstWs = page.locator('button').filter({ hasText: 'Front Pocket Bag Attach' }).first();
  await firstWs.click();
  await sleep(1200);

  // Kit the first item
  const kitBtn = page.getByRole('button', { name: 'Kit It' }).first();
  await kitBtn.click();
  await sleep(800);

  // Type name in modal
  const nameInput = page.getByPlaceholder('Enter your name');
  await typeSlowly(nameInput, 'Lakshmi S.');
  await sleep(600);
  await page.getByRole('button', { name: 'Kit It' }).last().click();
  await sleep(1500);

  // Kit second item
  const kitBtn2 = page.getByRole('button', { name: 'Kit It' }).first();
  await kitBtn2.click();
  await sleep(800);
  const nameInput2 = page.getByPlaceholder('Enter your name');
  await typeSlowly(nameInput2, 'Lakshmi S.');
  await sleep(500);
  await page.getByRole('button', { name: 'Kit It' }).last().click();
  await sleep(1500);

  // Verify first item
  const verifyBtn = page.getByRole('button', { name: 'Verify' }).first();
  await verifyBtn.click();
  await sleep(800);
  const nameInput3 = page.getByPlaceholder('Enter your name');
  await typeSlowly(nameInput3, 'Rajan M.');
  await sleep(500);
  await page.getByRole('button', { name: 'Verify' }).last().click();
  await sleep(1500);

  // Switch filter to "kitted"
  await page.getByRole('button', { name: 'kitted' }).click();
  await sleep(1200);
  await page.getByRole('button', { name: 'all' }).first().click();
  await sleep(1000);

  // ── 3. OB SHEET ─────────────────────────────────────────────────────────
  console.log('📋 OB Sheet...');
  await page.getByRole('link', { name: /OB Sheet/i }).click();
  await sleep(2000);

  // Distribute to first 3 operators one by one
  for (let i = 0; i < 3; i++) {
    const btn = page.getByRole('button', { name: 'Distribute' }).first();
    await btn.click();
    await sleep(700);
    const inp = page.getByPlaceholder('Enter your name');
    await typeSlowly(inp, 'Vimal IE');
    await sleep(400);
    await page.getByRole('button', { name: 'Confirm Distribution' }).click();
    await sleep(900);
  }

  // Mark All remaining
  await page.getByRole('button', { name: 'Mark All' }).click();
  await sleep(800);
  const inp = page.getByPlaceholder('Enter your name');
  await typeSlowly(inp, 'Vimal IE');
  await sleep(500);
  await page.getByRole('button', { name: 'Confirm Distribution' }).click();
  await sleep(2000);

  // ── 4. WIP RUN-DOWN ──────────────────────────────────────────────────────
  console.log('📉 WIP...');
  await page.getByRole('link', { name: /WIP/i }).click();
  await sleep(2000);

  // Log actual WIP for first two hour slots in Front Sub-Assembly
  const wipSlots = [
    { actual: '118', name: 'Ramesh S.' },
    { actual: '76', name: 'Ramesh S.' },
    { actual: '142', name: 'Ramesh S.' },  // behind!
  ];
  for (const slot of wipSlots) {
    const logBtn = page.getByRole('button', { name: '+ Log' }).first();
    await logBtn.click();
    await sleep(700);
    const actualInp = page.getByPlaceholder('0');
    await typeSlowly(actualInp, slot.actual, 60);
    await sleep(400);
    const nameInp = page.locator('#wip-name');
    await nameInp.click();
    await nameInp.fill(slot.name);
    await sleep(400);
    await page.getByRole('button', { name: 'Log', exact: true }).click();
    await sleep(900);
  }

  // Switch to Assembly tab
  await page.getByRole('button', { name: /Assembly/i }).first().click();
  await sleep(1500);

  // ── 5. TASKS ─────────────────────────────────────────────────────────────
  console.log('✅ Tasks...');
  await page.getByRole('link', { name: /Tasks/i }).click();
  await sleep(2000);

  // Filter to IE Engineer
  await page.getByRole('button', { name: 'IE Engineer' }).first().click();
  await sleep(1200);

  // Mark first task done
  const markDoneBtn = page.getByRole('button', { name: 'Mark Done' }).first();
  await markDoneBtn.click();
  await sleep(700);
  const taskName = page.getByPlaceholder('Enter your name');
  await typeSlowly(taskName, 'Suryaansii Singh');
  await sleep(400);
  const taskNotes = page.getByPlaceholder('Any remarks...');
  await typeSlowly(taskNotes, 'Completed on schedule', 50);
  await sleep(400);
  await page.getByRole('button', { name: 'Mark Done' }).last().click();
  await sleep(1200);

  // Sign off that task
  const signOffBtn = page.getByRole('button', { name: 'Sign Off' }).first();
  await signOffBtn.click();
  await sleep(700);
  const signName = page.getByPlaceholder('Enter your name');
  await typeSlowly(signName, 'Suryaansii Singh');
  await sleep(400);
  await page.getByRole('button', { name: 'Sign Off' }).last().click();
  await sleep(1500);

  // Show all roles filter
  await page.getByRole('button', { name: 'All Roles' }).click();
  await sleep(1500);

  // ── 6. BACK TO DASHBOARD ─────────────────────────────────────────────────
  console.log('🏠 Back to Dashboard...');
  await page.getByRole('link', { name: /Dashboard/i }).click();
  await sleep(3000);

  // ── 7. CONFIG ────────────────────────────────────────────────────────────
  console.log('⚙️  Config...');
  await page.getByRole('link', { name: /Config/i }).click();
  await sleep(2000);
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(1500);
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);

  // ── END ──────────────────────────────────────────────────────────────────
  console.log('🎬 Finishing...');
  await sleep(2000);
  await context.close();
  await browser.close();

  console.log(`\n✅ Video saved to: ${OUT_DIR}/`);
  console.log('   Look for the .webm file inside that folder.');
})();
