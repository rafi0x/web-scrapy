const puppeteer = require("puppeteer");

const scraper = {
  browser: null,
  page: null,
  url: null,
};

// assign the browser and page
scraper.init = async (url) => {
try {
    scraper.browser = await puppeteer.launch({ 
      headless: true,
      defaultViewport: null,
      args: [
          "--no-sandbox",
          '--disable-setuid-sandbox'
      ]
    });
    scraper.page = await scraper.browser.newPage();
    scraper.url = url;
    await scraper.page.setDefaultNavigationTimeout(80000);
  } catch (error) {
    console.log(error);
  }
};

// scrape data from web
scraper.getData = async (selector) => {
  try {
    // store final data here
    let contentArr;
    await scraper.page.waitForTimeout(1500);
    await scraper.page.evaluate(() => {
      document.addEventListener("DOMContentLoaded", () => {
        window.scrollTo(0, window.document.body.scrollHeight);
      });
    });
    await scraper.page.waitForSelector(selector.data);
    // if get any specific type
    if (selector.type == "link") {
      contentArr = await scraper.page.$$eval(selector.data, (raw) => {
        return raw.map((data) => data.getAttribute("href")); // get data from type
      });
    } else {
      contentArr = await scraper.page.$$eval(selector.data, (raw) => {
        return raw.map((data) => data.textContent); // get text
      });
    }

    return contentArr;
  } catch (error) {
    console.log(error);
  }
};

// execute getData from a single selectoor from multipage
scraper.exec = async (selector, nextBtn, pages) => {
  try {
    await scraper.page.goto(scraper.url, { waitUntil: "networkidle0" });

    let result = []; // get data from first page
    if (nextBtn && pages) {
      let index = 0;
      do {
        index++;
        // await scraper.page.waitForTimeout(2000);
        result = result.concat(await scraper.getData(selector));

        const nxtBt = await scraper.page.$(nextBtn);
        if (!nxtBt) break;

        if (index <= parseInt(pages) - 1) {
          await scraper.page.click(nextBtn);
        } else break;
      } while (index <= parseInt(pages));
    } else {
      result = result.concat(await scraper.getData(selector));
    }
    // result.map((e) => console.log(e));
    return result;
  } catch (error) {
    console.log(error);
  }
};

scraper.start = async (url, selector, nextBtn, pages) => {
  try {
    // the final data array
    let arr = [];
    for (let sel of selector) {
      await scraper.init(url);
      const results = await scraper.exec(sel, nextBtn, pages);
      arr.push(results);
      await scraper.browser.close();
    }
    return arr;
  } catch (error) {
    console.log(error);
  }
};

module.exports = scraper;
