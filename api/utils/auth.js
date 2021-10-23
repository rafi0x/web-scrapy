const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  "681056388663-iihuvvj38qlajomonj9t6r5fhnbuglbl.apps.googleusercontent.com",
  "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",
  "http://127.0.0.1:5000/api/v1/goto-sheets/"
);

module.exports = { oAuth2Client };
