const _ = require("lodash");
const fs = require("fs");
const scrape = require("../utils/scrapy");
const { oAuth2Client } = require("../utils/auth");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
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
    oAuth2Client.getToken(req.query.code, (err, token) => {
      if (err) return console.error("err from here", err);

      oAuth2Client.setCredentials(token);
      sheeto(oAuth2Client);
      setJWT(token);
    });
    // console.log(req.cookies.token);

    function setJWT(token) {
      const userToken = jwt.sign(
        { ...token },
        "1V6pxo9Ky9JZiEuPpOGzAw0nZPaDh0PDPP822vc",
        {
          expiresIn: token.expiry_date,
        }
      );
      console.log(userToken);
      return res.cookie("token", userToken, {
        expires: new Date(token.expiry_date),
        secure: false,
        httpOnly: true,
      });
    }

    // function verifyToken(token) {}

    async function sheeto(auth) {
      const sheets = google.sheets({ version: "v4", auth });

      const getRows = await sheets.spreadsheets.values.get({
        spreadsheetId: "1V6-pxo9-K-y9-JZiEuPpOGzAw0nZPaDh0PDPP8-22vc",
        range: "Sheet1!A:C",
      });
      console.log(getRows.data.values);
      res.send(getRows.data.values);
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = controller;
