const _ = require("lodash");
const fs = require("fs");
const scrape = require("../utils/scrapy");
const { oAuth2Client } = require("../utils/auth");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const controller = {};

controller.getScraper = (req, res) => {
  res.render("pages/index");
};

controller.startScraper = async (req, res, next) => {
  const url = req.body.url || null;
  const selector = req.body.selector || null;
  const nextBtn = req.body.nextBtn || null;
  const pages = req.body.pages || null;

  try {
    // initialize scraping function
    const neArr = await scrape.start(url, selector, nextBtn, pages);
    if (neArr.length === 0) return res.send(new Error("cant scrap"));

    // zipping the data, only 4 selector data allowed
    const fData = _.zip(neArr[0], neArr[1], neArr[2], neArr[3]);

    // send the zipped data
    res.send(JSON.stringify(fData));
  } catch (error) {
    console.log(error);
  }
};

controller.googleApi = (req, res) => {
  if (req.cookies.token !== undefined) return res.redirect("/sheets"); // redirect to sheets page

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  res.redirect(url); // url for google Sheets Auth
};

controller.tokenController = (req, res) => {
  if (!req.query.code) return res.redirect("/auth-google"); // if google auth url is in invalid

  //genetare gapi tokens and save as jwt cookie
  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return res.redirect("/auth-google");

    const userToken = jwt.sign({ ...token }, process.env.JWT_SEC_KEY, {
      expiresIn: token.expiry_date,
    });
    //set in cookie
    res.cookie("token", userToken, {
      expires: new Date(token.expiry_date),
      secure: false,
      httpOnly: true,
    });
    return res.redirect("/sheets"); // sheets page
  });
};

controller.getSheets = (req, res) => {
  if (!req.cookies.token) return res.redirect("/scraper");
  res.render("pages/sheet");
};

controller.sheetController = (req, res) => {
  const fileName = req.body.fileName || null;
  const sheetsId = req.body.sheetsId || null;
  const sheetName = req.body.sheetName;
  const values = req.body.data;

  const token = jwt.verify(
    req.cookies.token,
    process.env.JWT_SEC_KEY,
    (err, token) => {
      if (err) {
        console.error(err.message);
        return res.redirect("/auth-google");
      } else {
        return token;
      }
    }
  );

  // set the oauth token
  oAuth2Client.setCredentials(token);

  //init gSheets API
  const gSheets = google.sheets({ version: "v4", auth: oAuth2Client });

  if (fileName && sheetName && !sheetsId) {
    const resource = {
      properties: {
        title: fileName,
      },
    };
    // create new gSheet
    gSheets.spreadsheets.create(
      {
        resource,
        fields: "spreadsheetId",
      },
      (err, spreadsheet) => {
        if (err) return console.error(err);
        writeSheets(gSheets, spreadsheet.data.spreadsheetId, sheetName, values);

        return res.send({
          url: `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}/`,
        });
      }
    );
  } else if (sheetsId && sheetName && !fileName) {
    writeSheets(gSheets, sheetsId, sheetName, values);
    return res.redirect({
      url: `https://docs.google.com/spreadsheets/d/${sheetsId}/`,
    });
  }

  // function for wtire in Google spreadsheets
  const writeSheets = (api, sheetId, sheetName, values) => {
    const resource = {
      values,
    };

    api.spreadsheets.values.update(
      {
        spreadsheetId: sheetId,
        valueInputOption: "USER_ENTERED",
        range: `Sheet1!A:B`,
        resource,
      },
      (err) => {
        if (err) return console.error(err);
      }
    );
  };
};

module.exports = controller;
