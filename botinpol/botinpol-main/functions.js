var fs = require('fs');
var util = require('util');

let startTime = new Date();
let timeElapsed = () => (new Date()) - startTime;
let ok = (msg) => '[OK]['+timeElapsed()/1000+'] '+msg;
let err = (msg) => '[ERROR]['+timeElapsed()/1000+'] '+msg;


let checkForAvailableHours = async(page) => {
  let hoursAvailable = await page.evaluate(() => {
    hoursAvailable = document.querySelectorAll('.tiles--hours .row')[0].children.length;
    if(hoursAvailable.length > 0) {
      const lastHour = hoursAvailable[hoursAvailable.length - 1];
      lastHour.click();
    }
    return hoursAvailable;
  });
  if(hoursAvailable > 0)  {
    await solveSecondCaptcha(page);
    await page.waitForNavigation();
    await page.screenshot({ path: 'hrscrdump-' + new Date() + '.png', fullPage: true })

    return hoursAvailable;
  }
  return 0;
  console.log(ok('INPOL-BOT Hours available:' + hoursAvailable));
}

const selectDates = async(page) => {
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
}

const waitForCalendar = async (page) => await page.waitForSelector('.spinner .ng-star-inserted', {hidden: true, timeout: 300000});
const solveSecondCaptcha = async (page) => {
  await page.waitForSelector('#mat-dialog-0');
  await new Promise(r => setTimeout(r, 2000));
  await page.solveRecaptchas();
  await page.click('[type="Submit"]');
}

function init() {
  var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
  var log_stdout = process.stdout;
  console.log = function(d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
  };
}

const checkForLocationAndOrder = async (page, appLocationOpt, appQueueOpt) => {
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

let auth = async (page, login, pass, caseNumber) => {

  page.setDefaultNavigationTimeout(30000); 

  let siteReached = false;
  while(!siteReached) {
    try {
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
      await page.waitForSelector(resultsSelector, {timeout: 30000});
      siteReached = true;
    } catch(error) {
      console.log(err('INPOL-BOT ' + error)); 
    }
  }

  console.log(ok('INPOL-BOT https://inpol.mazowieckie.pl login successfull'));
  return true;
}

const postAuthAct = async (page) => {
  const appLocationOpt = '#mat-option-4'
  const appQueueOpt = '#mat-option-5'
  await checkForLocationAndOrder(page, appLocationOpt, appQueueOpt);
  await solveSecondCaptcha(page);
}

const gotoCaseDetails = async (page, caseNumber) => {
  await page.goto(`https://inpol.mazowieckie.pl/home/cases/${caseNumber}`);
  await page.waitForSelector('.cases__details');
}

const dumpResultPage = async(page) => {
 // await page.screenshot({ path: 'hrscrdump-' + new Date() + '.png', fullPage: true })
 // const data = await page.evaluate(() => document.querySelector('*').outerHTML);
 // toFile(data);
}

function toFile(content) {
  var log_file = fs.createWriteStream(__dirname + '/htmldump-' + new Date() + '.log', {flags : 'w'});
  log_file.write(util.format(content));
}

module.exports = {err, ok, dumpResultPage, gotoCaseDetails, postAuthAct, checkForAvailableHours, selectDates, auth, checkForLocationAndOrder, checkForAvailableHours, init, toFile, waitForCalendar, solveSecondCaptcha};