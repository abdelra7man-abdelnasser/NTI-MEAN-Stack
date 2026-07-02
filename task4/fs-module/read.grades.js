const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/grades.json");

function readGrades() {
  const data = fs.readFileSync(filePath, "utf8");
  const grades = JSON.parse(data);

  console.log("All Student Grades:");
  grades.forEach((s) =>
    console.log(`- [${s.id}] ${s.name} | ${s.subject} | Grade: ${s.grade}`)
  );

  return grades;
}

module.exports = readGrades;
