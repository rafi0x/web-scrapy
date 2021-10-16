const _ = require("lodash");
const scrape = require("../utils/scrapy");
const fs = require("fs");
const path = require("path");
const controller = {};
const exportUsersToExcel = require("../utils/xlsx");

controller.getRequest = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.nextBtn || null;
  const pages = req.body.pages || null;
  // const workSheetColumnName = [];

  try {
    //

    const neArr = await scrape.start(url, selector, nextBtn, pages);
    const fData = await _.zip(neArr[0], neArr[1]);

    // selector.map((sel) => workSheetColumnName.push(sel.name));

    res.send(JSON.stringify(fData));
  } catch (error) {
    console.log(error);
  }
};

controller.exportXls = (req, res, next) => {
  const header = req.body.header || null;
  const data = req.body.data || null;
  const url = req.body.url || null;
  if (header.length > 0 && data.length > 0 && url) {
    const fileName = `${url.replace(/.+\/\/|www.|\..+/g, "")}.xls`;

    const workSheetName = url.replace(/.+\/\/|www.|\/.+/g, "");

    fs.writeFile(`./data/${fileName}`, "", () => {
      const filePath = `./data/${fileName}`;
      exportUsersToExcel(fData, workSheetColumnName, workSheetName, filePath);
    });
  }
};

module.exports = controller;
