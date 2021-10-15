const fs = require("fs");
const exportUsersToExcel = require("./xlsx");

const users = [];

const workSheetColumnName = ["ID", "Name", "Age"];

const workSheetName = "Users";
const writeFile = fs.writeFile("data.xls", "", () => {
  console.log("file created");
});
console.log(writeFile);
const filePath = `./data.xls`;

exportUsersToExcel(users, workSheetColumnName, workSheetName, filePath);
