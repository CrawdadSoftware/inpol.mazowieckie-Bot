const puppeteer = require('puppeteer-extra')


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
// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async browser => {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(120000); 

    await page.goto('https://inpol.mazowieckie.pl/login');
    await page.waitForSelector('#mat-input-0');

   // console.log(ok('INPOL-BOT https://inpol.mazowieckie.pl succeessfully loaded'));

    const login = 'cudzoziemcy12@op.pl';
    const password = 'Cudzoziemcy12';


    await page.type('#mat-input-0', login);
    await page.type('#mat-input-1', password);
    
    await page.solveRecaptchas();
    //console.log(ok('INPOL-BOT recaptcha successfully '));

    const submitBtn = '.btn.btn--submit';
    //await page.waitForSelector(submitBtn);
    await page.click(submitBtn);

  
    await page.screenshot({ path: 'response.png', fullPage: true })
    //await browser.close()
  })


  /*
const url = process.argv[2];
if (!url) {
    throw "Please provide a URL as the first argument";
}

async function run () {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({path: 'screenshot.png'});
    browser.close();
}
run();


*/