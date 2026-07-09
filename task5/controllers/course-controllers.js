const fs = require("fs");

let courses = JSON.parse(fs.readFileSync("./data/courses-data.json", "utf-8"));

const getAllCourses = (req, res) => {
  res.status(200).json({
    status: "success",
    count: courses.length,
    data: { courses },
  });
};

const getCourseById = (req, res) => {
  const course = courses.find((c) => c.id === +req.params.id);

  if (!course) {
    return res.status(404).json({ status: "error", message: "Course not found" });
  }

  res.status(200).json({ status: "success", data: { course } });
};

const createCourse = (req, res) => {
  const newCourse = {
    id: courses[courses.length - 1].id + 1,
    ...req.body,
  };

  courses.push(newCourse);

  fs.writeFile("./data/courses-data.json", JSON.stringify(courses, null, 2), () => {
    res.status(201).json({
      status: "success",
      message: "New course added",
      data: { course: newCourse },
    });
  });
};

const updateCourse = (req, res) => {
  const index = courses.findIndex((c) => c.id === +req.params.id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Course not found" });
  }

  const updatedCourse = Object.assign(courses[index], req.body);

  fs.writeFile("./data/courses-data.json", JSON.stringify(courses, null, 2), () => {
    res.status(200).json({
      status: "success",
      message: "Course updated successfully",
      data: { course: updatedCourse },
    });
  });
};

const deleteCourse = (req, res) => {
  const index = courses.findIndex((c) => c.id === +req.params.id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Course not found" });
  }

  const deleted = courses.splice(index, 1)[0];

  fs.writeFile("./data/courses-data.json", JSON.stringify(courses, null, 2), () => {
    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
      data: { course: deleted },
    });
  });
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
