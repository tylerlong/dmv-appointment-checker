const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: process.env.headless === 'true' })
  const page = await browser.newPage()
  await page.goto('https://www.dmv.ca.gov/wasapp/foa/driveTest.do')
  const list = await page.evaluate(function () {
    const result = []
    for (let item of document.querySelectorAll('#officeId option')) {
      result.push({ value: item.value, text: item.text })
    }
    return result
  })
  list.forEach(({ value, text }) => {
    console.log(value, text)
    // todo: check dates
  })
  await page.screenshot({ path: 'dmv.png' })
  await browser.close()
})()
