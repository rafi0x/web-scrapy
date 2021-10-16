const _ = require("lodash");
const scrape = require("../utils/scrapy");
const fs = require("fs");
const path = require("path");
const controler = {};
const exportUsersToExcel = require("../utils/xlsx");

controler.getRequest = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.nextBtn || null;
  const pages = req.body.pages || null;
  const workSheetColumnName = [];

  try {
    // const fileName = `${url.replace(/.+\/\/|www.|\..+/g, "")}.xls`;

    // const neArr = await scrape.start(url, selector, nextBtn, pages);
    // const fData = await _.zip(neArr[0], neArr[1]);

    // selector.map((sel) => workSheetColumnName.push(sel.name));

    // const workSheetName = fileName.replace(".xls", "");
    // fs.writeFile(`./data/${fileName}`, "", () => {
    //   const filePath = `./data/${fileName}`;
    //   exportUsersToExcel(fData, workSheetColumnName, workSheetName, filePath);
    // });
    console.log(req.body);
  } catch (error) {
    console.log(error);
  }

  res.send("working");
};

module.exports = controler;
