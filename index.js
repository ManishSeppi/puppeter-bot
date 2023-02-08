import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import fs from 'fs';
import AudioRecorder from 'node-audiorecorder';
import * as PuppeteerScreenRecorder from 'puppeteer-screen-recorder'


puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [],
    ignoreDefaultArgs: false,
    executablePath: executablePath(),
  });

  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  const context = browser.defaultBrowserContext();

  await context.overridePermissions(
    "https://meet.google.com/", ["microphone", "camera", "notifications"]
  );

  // going to Meet after signing in
  await page.waitForTimeout(2500);
  await page.goto('https://meet.google.com/mdy-ipnd-urm' + '?hl=en', {
    waitUntil: 'networkidle0',
    timeout: 10000,
  });

  await navigationPromise;

  await page.waitForSelector('input[aria-label="Your name"]', {
    visible: true,
    timeout: 50000,
    hidden: false,
  });

  // turn off cam using Ctrl+E
  await page.waitForTimeout(1000);
  await page.keyboard.down('ControlLeft');
  await page.keyboard.press('KeyE');
  await page.keyboard.up('ControlLeft');
  await page.waitForTimeout(1000);

  //turn off mic using Ctrl+D
  await page.waitForTimeout(1000);
  await page.keyboard.down('ControlLeft');
  await page.keyboard.press('KeyD');
  await page.keyboard.up('ControlLeft');
  await page.waitForTimeout(1000);

  //click on input field to enter name
  await page.click(`input[aria-label="Your name"]`);

  //enter name
  await page.type(`input[aria-label="Your name"]`, 'Bot');

  //click on ask to join button
  await page.click(
    `button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc LQeN7 jEvJdc QJgqC"]`
  );

  const recorder = new PuppeteerScreenRecorder.PuppeteerScreenRecorder(page);
  await recorder.start('./report/video/simple.webm'); // supports extension - mp4, avi, webm and mov

  setTimeout(async() => {
    await recorder.stop();
    await browser.close();  
  }, 50000)

})();