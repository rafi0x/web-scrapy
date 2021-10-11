const _ = require("lodash");
const scrape = require("../utils/scrapy");
const controler = {};

controler.getRequest = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.next || null;
  const pages = req.body.page || null;

  await scrape.init(url);
  const neArr = await scrape.start(selector, nextBtn, pages);

  res.send("working");
};

module.exports = controler;
