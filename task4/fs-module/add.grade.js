const fs = require("fs");
const path = require("path");
const saveGrades = require("./save.grades");

const filePath = path.join(__dirname, "../data/grades.json");

function addGrade(name, subject, grade) {
  const grades = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const newStudent = {
    id: grades.length + 1,
    name,
    subject,
    grade,
  };

  grades.push(newStudent);
  saveGrades(grades);

  console.log(`${name} added with grade ${grade} in ${subject}.`);
}

module.exports = addGrade;
