const _ = require("lodash");
const fs = require("fs");
const scrape = require("../utils/scrapy");
const { oAuth2Client } = require("../utils/auth");
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
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  res.redirect(url);
};

controller.gotoSheet = (req, res) => {
  try {
    const sheeto = async (auth) => {
      const sheets = google.sheets({ version: "v4", auth });

      const getRows = await sheets.spreadsheets.values.get({
        spreadsheetId: "1V6-pxo9-K-y9-JZiEuPpOGzAw0nZPaDh0PDPP8-22vc",
        range: "Sheet1!A:C",
      });
      console.log(getRows.data.values);
    };

    fs.readFile("token.json", (err, token) => {
      if (err || JSON.parse(token).expiry_date < Date.now()) {
        oAuth2Client.getToken(req.query.code, (err, newToken) => {
          if (err) return console.error(err);

          fs.writeFile("token.json", JSON.stringify(newToken), (err) => {
            if (err) return console.error(err);
            oAuth2Client.setCredentials(newToken);
            sheeto(oAuth2Client);
          });
        });
      }
      oAuth2Client.setCredentials(JSON.parse(token));
      sheeto(oAuth2Client);
    });

    res.send("getRows");
  } catch (error) {
    console.error(error);
  }
};
module.exports = controller;
