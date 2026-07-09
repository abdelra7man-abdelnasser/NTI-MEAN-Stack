const express = require("express");
const courseRouter = require("./routes/course-routes");

const app = express();

app.use(express.json());

app.use("/api/v1/courses", courseRouter);

app.all("/{*splat}", (req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.listen(5000, () => console.log("Server listening on http://localhost:5000"));
