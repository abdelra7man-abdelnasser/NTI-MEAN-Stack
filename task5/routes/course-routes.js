const express = require("express");
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require("../controllers/course-controllers");

const router = express.Router();

router.route("/").get(getAllCourses).post(createCourse);

router.route("/:id").get(getCourseById).patch(updateCourse).delete(deleteCourse);

module.exports = router;
