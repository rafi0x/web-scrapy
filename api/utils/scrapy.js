const puppeteer = require("puppeteer");

const scraper = {
  browser: null,
  page: null,
  url: null,
};

// assign the browser and page
scraper.init = async (url) => {
  try {
    scraper.browser = await puppeteer.launch({ headless: false });
    scraper.page = await scraper.browser.newPage();
    scraper.url = url;
  } catch (error) {
    console.log(error);
  }
};

// scrape data from web
scraper.getData = async (selector, typ) => {
  try {
    // store final data here
    let contentArr;
    await scraper.page.goto(scraper.url, { waitUntil: "networkidle0" }); // open the url
    // console.log(`${typ}`);

    // if get any specific type
    if (typ === "href") {
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

// execute getData for multipage
scraper.exec = async (selector, nextBtn, pages, ty) => {
  const result = await scraper.getData(selector, ty); // get data from first page
  if (pages && nextBtn && result) {
    let i = 0;
    do {
      i++;
      let nBtn = await scraper.page.$(nextBtn); // select next button
      if (nBtn) {
        await nBtn.click();
        const nxtData = await scraper.getData(selector, ty); /// get data from the next page
        nxtData.map((data) => result.push(data));
      } else break;
    } while (i < parseInt(pages));
  }
  return result;
};

scraper.start = async (selector, nextBtn, pages) => {
  try {
    // the final data array
    let arr = [];
    for (let sel of selector) {
      let result = null;
      switch (sel.type) {
        case "text": {
          result = await scraper.exec(sel, nextBtn, pages, null);
          break;
        }
        case "img": {
          result = await scraper.exec(sel, nextBtn, pages, "src");
          break;
        }
        case "link": {
          result = await scraper.exec(sel, nextBtn, pages, "href");
          break;
        }
      }
      arr.push(result);
    }
    await scraper.browser.close();
    return arr;
  } catch (error) {
    console.log(error);
  }
};

module.exports = scraper;
