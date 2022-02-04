const _ = require("lodash");
const path = require("path");
const scrape = require("../utils/scrapy");
const { oAuth2Client } = require("../utils/auth");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const controller = {};

controller.getScraperPage = (req, res) => {
  return res.sendFile(path.resolve(__dirname + '../../../public/index.html'));
};
controller.getSheetPage = (req, res) => {
  if(req.cookies.token) return res.sendFile(path.resolve(__dirname + '../../../public/sheet.html'));
  else return res.redirect("/api/v1/google-api/")

};

controller.startScraper = async (req, res) => {
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
  if (req.cookies.token !== undefined) {
    return res.redirect("/sheets"); // redirect to sheets page
  } else {
    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    res.redirect(url); // url for google Sheets Auth
  }
};
// #component_2 > div > div:nth-child(1) > span > div.bGnIM > div.emrzT.Vt.o > div.eOWjb > div.eWmDv.DqZJV > span > a > span
controller.tokenController = (req, res) => {
  if (!req.query.code) return res.redirect("/api/v1/google-api/"); // if google auth url is in invalid

  //generate gapi tokens and save as jwt cookie
  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return res.redirect("/api/v1/google-api/");

    const userToken = jwt.sign({ ...token }, process.env.JWT_SEC_KEY, {
      expiresIn: token.expiry_date,
    });
    //set in cookie
    res.cookie("token", userToken, {
      expires: new Date(token.expiry_date),
      secure: false,
      httpOnly: false,
    });
    return res.redirect("/sheets"); // sheets page
  });
};

controller.sheetController = (req, res) => {
  const fileName = req.body.fileName || null;
  const sheetsId = req.body.sheetsId || null;
  const sheetName = req.body.sheetName;
  const values = req.body.data;

  const token = jwt.verify(
    req.body.jwt,
    process.env.JWT_SEC_KEY
  );
  // set the oauth token
  if (!token) return res.redirect("/api/v1/google-api/");
  oAuth2Client.setCredentials(token);

  //init gSheets API
  const gSheets = google.sheets({ version: "v4", auth: oAuth2Client });

  // function for write in Google spreadsheets
  const writeSheets = (api, sheetId, sheetName, values) => {
    const resource = {
      values,
    };
    api.spreadsheets.values.update(
        {
          spreadsheetId: sheetId,
          valueInputOption: "USER_ENTERED",
          range: `${sheetName}!A:D`,
          resource,
        },
        (err) => {
          if (err) {
            console.error("sheetController", err);
            res.json({ error: err.errors[0].message });
          }
        }
    );
  };

  if (fileName && sheetName && !sheetsId) {
    const resource = {
      properties: {
        title: fileName,
      },
      sheets: [
        {
          properties: {
            sheetType: "GRID",
            sheetId: 0,
            title: sheetName,
          },
        },
      ],
    };
    // create new gSheet
    gSheets.spreadsheets.create(
      {
        resource,
        fields: "spreadsheetId",
      },
      (err, spreadsheet) => {
        if (err) return console.error("goolge api write", err);
        writeSheets(gSheets, spreadsheet.data.spreadsheetId, sheetName, values);
        console.log(
          `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}/`
        );
        return res.json({
          url: `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}/`,
        });
      }
    );
  } else if (sheetsId && sheetName && !fileName) {
    writeSheets(gSheets, sheetsId, sheetName, values);
    console.log(`https://docs.google.com/spreadsheets/d/${sheetsId}/`);
    return res.json({
      url: `https://docs.google.com/spreadsheets/d/${sheetsId}/`,
    });
  }

};

module.exports = controller;