const readGrades = require("./modules/read.grades");
const addGrade = require("./modules/add.grade");
const deleteGrade = require("./modules/delete.grade");
const updateGrade = require("./modules/update.grade");

console.log("--- Initial Grades ---");
readGrades();

console.log("\n--- Adding Mona ---");
addGrade("Mona", "Biology", 95);

console.log("\n--- Updating Omar's Grade ---");
updateGrade("Omar", 88);

console.log("\n--- Deleting Sara ---");
deleteGrade("Sara");

console.log("\n--- Final Grades ---");
readGrades();
