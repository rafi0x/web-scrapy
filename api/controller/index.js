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
  if (req.cookies.token !== undefined)
    return res.redirect("/api/v1/sheet-api/");

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  res.redirect(url);
};

controller.tokenController = (req, res) => {
  if (!req.query.code) return res.redirect("/api/v1/google-api/");

  if (req.cookies.token !== undefined)
    return res.redirect("/api/v1/sheet-api/");

  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return res.redirect("/api/v1/google-api/");

    const userToken = jwt.sign({ ...token }, process.env.JWT_SEC_KEY, {
      expiresIn: token.expiry_date,
    });
    res.cookie("token", userToken, {
      expires: new Date(token.expiry_date),
      secure: false,
      httpOnly: true,
    });
    return res.redirect(302, "/api/v1/sheet-api/");
  });

  //
};

controller.sheetController = (req, res) => {
  if (req.cookies.token === undefined)
    return res.redirect("/api/v1/google-api/");

  const token = jwt.verify(
    req.cookies.token,
    process.env.JWT_SEC_KEY,
    (err, token) => {
      if (err) {
        console.error(err.message);
        return res.redirect("/api/v1/google-api/");
      } else {
        return token;
      }
    }
  );

  oAuth2Client.setCredentials(token);

  const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "1V6-pxo9-K-y9-JZiEuPpOGzAw0nZPaDh0PDPP8-22vc",
      range: "Sheet1!A:C",
    },
    (err, result) => {
      if (err) {
        res.clearCookie("token");
        return res.send(err.errors);
      }
      return res.send(result.data.values);
    }
  );
};
module.exports = controller;
