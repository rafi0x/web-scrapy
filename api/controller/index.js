const _ = require("lodash");
const scrape = require("../utils/scrapy");
const url = require("../utils/auth");
const { google } = require("googleapis");
const controller = {};

controller.getRequest = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.nextBtn || null;
  const pages = req.body.pages || null;

  try {
    const neArr = await scrape.start(url, selector, nextBtn, pages);
    if (neArr.length === 0) res.send(new Error("cant scrap"));
    const fData = _.zip(neArr[0], neArr[1], neArr[2], neArr[3]);
    res.send(JSON.stringify(fData));
  } catch (error) {
    console.log(error);
  }
};
controller.googleApi = (req, res) => {
  res.redirect(url);
};
controller.gotoSheet = async (req, res) => {
  console.log(req.query.code);
  const sheets = google.sheets({ version: "v4", auth: req.query.code });
  const metaData = await sheets.spreadsheets.get({
    auth: req.query.code,
    spreadsheetId: "1V6-pxo9-K-y9-JZiEuPpOGzAw0nZPaDh0PDPP8-22vc",
  });
  const getRows = await sheets.spreadsheets.values.get({
    auth: req.query.code,
    spreadsheetId: "1V6-pxo9-K-y9-JZiEuPpOGzAw0nZPaDh0PDPP8-22vc",
    range: "Sheet1!A:A",
  });
  console.log(getRows);
  res.send(getRows);
};
module.exports = controller;
