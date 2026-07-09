const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require("express");

const couresRouter = require("./routes/course-routes");
const dbConnect = require("./config/dbconnect");

require("dotenv").config();

const app = express();
dbConnect();


app.use(express.json());
app.use("/api/v1/courses", couresRouter);

app.all("/", (req,res)=>{
    res.status(404).json({
        status: "error",
        mesage: "Route Not Found"
    });

});

app.listen(process.env.PORT, ()=> console.log("Server listening on http://localhost:5000"));