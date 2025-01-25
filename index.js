#!/usr/bin/env node

import {v4} from "uuid";
import {unlink} from 'node:fs/promises'
import {exec} from 'child_process'
import fs from 'node:fs'
import {initializeDatabase} from "./initilizeDatabase.js";
import puppeteer from "puppeteer";
import {program} from 'commander';

const delimiter = '|'
const id = v4();
const fileName = `${id}.md`

function waitForUserInput() {
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function openBrowser(allowBrowsing){
  return puppeteer.launch({
      args: ['--disable-http2'],
      headless: !allowBrowsing,
    });
}

async function browsePage(url, browser, allowBrowsingFirst){
  return browser.newPage()
    .then(async (page) => {
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;'
      })
      if (!allowBrowsingFirst) {
        await page.goto(url, {waitUntil: ['networkidle2', 'domcontentloaded']});
        // wait 3 second
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        await page.goto(url)
        console.log('press enter when you are done...')
        await waitForUserInput()
      }
      return page
    })
}

async function scrapePage(page) {
  const html = await page.content();
  const textContent = await page.evaluate(() => document.body.innerText);
  const hyperlinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'), a => {
      return {link: a.href, text: a.innerText}
    })
  })

  return new Promise((resolve) => {
    resolve({html, textContent, hyperlinks})
  })
}

async function manuallyIdentifyJobAds(links) {
  let mappedLinks = links.map((link, index) => `${index}${delimiter}${link.text.replaceAll('\n', ' ').replaceAll(delimiter, ' ')}${delimiter}`);
  fs.writeFileSync(fileName, mappedLinks.join('\n'))

  exec(`subl ${fileName}`)
  console.log('press enter when you are done...')
  await waitForUserInput()

  return fs.readFileSync(fileName, 'utf-8');
}

function logToDatabase(url, html, innerText, file, links) {
  return initializeDatabase().then(async (db) => {
    await db.run('INSERT INTO careerPage (id, url, innerText, html, date) VALUES (?, ?, ?, ?, unixepoch())', [id, url, innerText, html])

    for (const line1 of file.split('\n').map((line) => line.split(delimiter))) {
      await db.run('INSERT INTO hyperlinks (careerPageId, url, innerText, isJobPosting, jobTitle, jobLocation) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          links[parseInt(line1[0])].link,
          links[parseInt(line1[0])].text,
          line1[2] ? 1 : 0,
          line1[2],
          line1[3]
        ])
    }
  })
}

async function logJobAdsFromUrl(url, allowBrowsingFirst){
  let b
  try{
    console.log('opening browser')
    const {html, textContent, hyperlinks} = await openBrowser(allowBrowsingFirst)
      .then((browser) => {
        b = browser
        return browsePage(url, browser, allowBrowsingFirst)
      })
      .then((page) => scrapePage(page))
      .catch(console.error)
    console.log('page scraped, now manually identify job ads')
    await manuallyIdentifyJobAds(hyperlinks)
      .then(file => {
        console.log('logging to database')
        return logToDatabase(url, html, textContent, file, hyperlinks)
      })
      .catch(console.error)
  } finally {
    await unlink(fileName)
    b?.close()
  }

  console.log('done')
  process.exit()
}

program.option('-b, --browsing', 'Allow browsing first')
  .argument('<url>', 'URL to scrape')
  .action((url, options) => {
    const allowBrowsingFirst = options.browsing || false
    logJobAdsFromUrl(url, allowBrowsingFirst)
  })

program.parse(process.argv);
