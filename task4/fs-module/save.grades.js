const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/grades.json");

function saveGrades(grades) {
  fs.writeFileSync(filePath, JSON.stringify(grades, null, 2));
}

module.exports = saveGrades;
