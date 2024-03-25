const puppeteer = require('puppeteer-extra')
var fs = require('fs');
var util = require('util');

let startTime = new Date();

let timeElapsed = () => (new Date()) - startTime;
let ok = (msg) => '[OK]['+timeElapsed()/1000+'] '+msg;
let err = (msg) => '[ERROR]['+timeElapsed()/1000+'] '+msg;

init();

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: 'f731885edbe7a479f23d024723017e7c' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

const runner = async () => { 
  const browser = await puppeteer.launch({headless: false, args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']});
  console.log(ok('INPOL-BOT Started'));

  const login = 'cudzoziemcy12@op.pl';
  const password = 'Cudzoziemcy12';
  const caseNumber = '37F2BCE1-1CBD-41A7-9A04-6E80C7CFFEDB';


  try {

    const page = await browser.newPage();
    await page.setViewport({
      width: 1600,
      height: 1200,
      deviceScaleFactor: 1,
    });
    await auth(page, login, password, caseNumber);

    const appLocationOpt = '#mat-option-4'
    const appQueueOpt = '#mat-option-5'

    await checkForLocationAndOrder(page, appLocationOpt, appQueueOpt);

    await page.waitForSelector('#mat-dialog-0');
    await new Promise(r => setTimeout(r, 2000));
    await page.solveRecaptchas();
    console.log(ok('INPOL-BOT recaptcha solved successfully'));
    await new Promise(r => setTimeout(r, 2000));
    await page.click('[type="Submit"]');
    const calSpinner = '.spinner .ng-star-inserted'

    await page.waitForSelector(calSpinner, {hidden: true, timeout: 300000});

    const calendarNextMonthButton = '.mat-focus-indicator.mat-calendar-next-button.mat-icon-button.mat-button-base';
    await page.waitForSelector(calendarNextMonthButton);
    await page.click(calendarNextMonthButton); 
    await page.click(calendarNextMonthButton); 


    await page.evaluate(() => {
      const dates = document.querySelectorAll(
        'tr.ng-star-inserted td[class="mat-calendar-body-cell ng-star-inserted"]'
      )
      const lastDate = dates[dates.length - 1]
      lastDate.click();
    });

    await page.waitForSelector(calSpinner, {hidden: true, timeout: 300000});


    const hoursAvailable = await page.evaluate(() => {
      return document.querySelectorAll('.tiles--hours .row')[0].children.length;
    });
    
    console.log(ok('INPOL-BOT Hours available:' + hoursAvailable));
  
    await page.screenshot({ path: 'hrscrdump-' + new Date() + '.png', fullPage: true })
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    toFile(data);
    await browser.close();

  } catch (error) {
    console.log(err('INPOL-BOT ' + error));
  //  await browser.close();

  }

}

//const resultsSelector = '.col-lg-6 .card.card--border';
//await page.waitForSelector(resultsSelector);
function init() {
  var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
  var log_stdout = process.stdout;
  console.log = function(d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
  };
}

function toFile(content) {
  var log_file = fs.createWriteStream(__dirname + '/htmldump-' + new Date() + '.log', {flags : 'w'});
  log_file.write(util.format(content));
}

const checkForLocationAndOrder = async (page, appLocationOpt, appQueueOpt) => {
  // Click appointment btn works by this way
  await page.evaluate(() => {
    document.querySelector(
      '.accordion [class="accordion__item"]:nth-child(2) button.btn--accordion'
    ).click();
  });

  // Click location
  const appLocationBtn = '#mat-select-0'
  await page.waitForSelector(appLocationBtn, {visible: true});
  await page.click(appLocationBtn);

  // Select location option
  await page.waitForSelector(appLocationOpt, {visible: true});
  await page.click(appLocationOpt);

  // Select a queue
  const appQueueBtn = '#mat-select-2'
  await page.waitForSelector(appQueueBtn, {visible: true});
  await page.click(appQueueBtn);

  // Select queue option
  await page.waitForSelector(appQueueOpt, {visible: true});
  await page.click(appQueueOpt);

}

const auth = async (page, login, pass, caseNumber) => {

  page.setDefaultNavigationTimeout(30000); 

  await page.goto('https://inpol.mazowieckie.pl/login');
  await page.waitForSelector('#mat-input-0');

  console.log(ok('INPOL-BOT https://inpol.mazowieckie.pl successfully loaded'));

  await page.type('#mat-input-0', login);
  await page.type('#mat-input-1', pass);

  await page.solveRecaptchas();
  console.log(ok('INPOL-BOT recaptcha solved successfully'));

  await new Promise(r => setTimeout(r, 2000));
  await page.click('.login__content');

  const submitBtn = '.btn.btn--submit';
  await page.click(submitBtn);

  const resultsSelector = '.col-lg-6 .card.card--border';
  await page.waitForSelector(resultsSelector, {timeout: 90000});

  console.log(ok('INPOL-BOT https://inpol.mazowieckie.pl login successfull'));

  await page.goto(`https://inpol.mazowieckie.pl/home/cases/${caseNumber}`);
  await page.waitForSelector('.cases__details');


};


runner();
const repeatTime = 3 * 60 * 1000
setInterval(runner, repeatTime)

