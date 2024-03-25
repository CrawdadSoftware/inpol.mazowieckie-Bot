var fs = require('fs');
var util = require('util');
const puppeteer = require('puppeteer-extra');
var inpol = require('./functions.js');
var env = require('./config.js');
console.log(env);

inpol.init();

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: env.config.captchaApiToken 
    },
    visualFeedback: true 
  })
)

const runner = async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']});
  console.log(inpol.ok('INPOL-BOT Started'));

  const page = await browser.newPage();
  await page.setViewport({
    width: 1600,
    height: 1200,
    deviceScaleFactor: 1,
  });

  let isAuthenticated = false;

  const maxAttempts = 30;
  var attemptCount = 0;
  while(attemptCount < maxAttempts) {
    try {
      if(!isAuthenticated) {
        isAuthenticated = await inpol.auth(page, env.config.login, env.config.password, env.config.caseNumber); 
      }
      await inpol.gotoCaseDetails(page, env.config.caseNumber)
      await inpol.postAuthAct(page);
      await inpol.waitForCalendar(page);
      await inpol.selectDates(page);
      await inpol.waitForCalendar(page);
      let nHours = await inpol.checkForAvailableHours(page);
      if(nHours !== 0) break;
    } catch(error) {
      console.log(inpol.err('INPOL-BOT ' + error)); 
      ++attemptCount;
    }
  }
  await inpol.dumpResultPage(page);
  await browser.close();
}
runner();
//const repeatTime = 3 * 60 * 1000
//setInterval(runner, repeatTime)

