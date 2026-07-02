const fs = require("fs");
const path = require("path");
const saveGrades = require("./save.grades");

const filePath = path.join(__dirname, "../data/grades.json");

function updateGrade(nameOrId, newGrade) {
  const grades = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const student = grades.find(
    (s) => s.id === nameOrId || s.name === nameOrId
  );

  if (!student) {
    console.log(`No student found with ID or name: ${nameOrId}`);
    return;
  }

  const oldGrade = student.grade;
  student.grade = newGrade;
  saveGrades(grades);

  console.log(`${student.name}'s grade updated from ${oldGrade} to ${newGrade}.`);
}

module.exports = updateGrade;
