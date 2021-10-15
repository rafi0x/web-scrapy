const _ = require("lodash");
const scrape = require("../utils/scrapy");
const fs = require("fs");
const controler = {};
const exportUsersToExcel = require("../../playground/xlsx");

controler.getRequest = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.nextBtn || null;
  const pages = req.body.pages || null;

  const fileName = `${url.replace(/.+\/\/|www.|\..+/g, "")}.xls`;

  const neArr = await scrape.start(url, selector, nextBtn, pages);
  const fData = _.zip(neArr[0], neArr[1]);

  const workSheetColumnName = ["ID", "Name"];

  const workSheetName = fileName.replace(".xls", "");
  const writeFile = fs.writeFile(`./${fileName}`, "", () => {
    console.log("file created");
  });
  const filePath = `./${fileName}`;

  exportUsersToExcel(fData, workSheetColumnName, workSheetName, filePath);

  res.send("working");
};

module.exports = controler;
