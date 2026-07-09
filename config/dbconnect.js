const mongoose = require("mongoose");

const dbConnect = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName : process.env.DB_name,
        });
        console.log("Database Connected Successfully.");
    }
    catch(error){
        console.log(`Databsse Connection error : ${error.message}`);
    }
}

module.exports = dbConnect;