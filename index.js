const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: process.env.headless === 'true' })
  const page = await browser.newPage()

  // do not load images, to speed up
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setRequestInterception(true)
  page.on('request', request => {
    // if (request.resourceType() === 'stylesheet' || request.resourceType() === 'font' || request.resourceType() === 'image') {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })

  // get list of DMV offices
  await page.goto('https://www.dmv.ca.gov/wasapp/foa/driveTest.do', { timeout: 0 })
  const list = await page.evaluate(function () {
    const result = []
    for (let item of document.querySelectorAll('#officeId option')) {
      if (item.value && item.text) {
        result.push({ value: item.value, text: item.text })
      }
    }
    return result
  })

  for (let item of list) {
    const { value, text } = item
    console.log(value, text)
    await page.goto('https://www.dmv.ca.gov/wasapp/foa/driveTest.do', { timeout: 0 })
    await page.evaluate(async function (env, item) {
      document.getElementById('officeId').value = item.value
      document.getElementById('DT').click()// select "Automobile"
      document.getElementById('firstName').value = env.firstName
      document.getElementById('lastName').value = env.lastName
      document.getElementById('dl_number').value = env.dl_number
      document.getElementById('birthMonth').value = env.birthMonth
      document.getElementById('birthDay').value = env.birthDay
      document.getElementById('birthYear').value = env.birthYear
      document.getElementById('areaCode').value = env.areaCode
      document.getElementById('telPrefix').value = env.telPrefix
      document.getElementById('telSuffix').value = env.telSuffix
      window.onSubmit()
    }, process.env, item)
    await page.screenshot({ path: 'dmv.png' })
    break
  }

  // list.forEach(async ({ value, text }) => {
  //   console.log(value, text)
  // })
  // await page.screenshot({ path: 'dmv.png' })
  // await browser.close()
})()
