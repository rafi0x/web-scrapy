const _ = require("lodash");
const scrape = require("../utils/scrapy");
const controller = {};

controller.getRequest = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.nextBtn || null;
  const pages = req.body.pages || null;
  const header = ["name", "title"];
  try {
    const neArr = await scrape.start(url, selector, nextBtn, pages);
    const fData = _.zip(neArr[0], neArr[1]);
    res.send(JSON.stringify(fData));
  } catch (error) {
    console.log(error);
  }
};

controller.googleApi = (req, res, next) => {
  // working on it
};
//
module.exports = controller;
