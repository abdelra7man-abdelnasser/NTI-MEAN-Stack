const fs = require("fs");
const path = require("path");
const saveGrades = require("./save.grades");

const filePath = path.join(__dirname, "../data/grades.json");

function deleteGrade(nameOrId) {
  let grades = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const index = grades.findIndex(
    (s) => s.id === nameOrId || s.name === nameOrId
  );

  if (index === -1) {
    console.log(`No student found with ID or name: ${nameOrId}`);
    return;
  }

  const removed = grades.splice(index, 1)[0];
  saveGrades(grades);

  console.log(`${removed.name} deleted successfully.`);
}

module.exports = deleteGrade;
