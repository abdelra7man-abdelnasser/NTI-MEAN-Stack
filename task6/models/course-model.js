const mongoose =require("mongoose");

const courseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, " Course title is required"],
        unique: true,
        trim: true,
        minlength: [3, "Course title must be at least 3 characters"],
        maxlength: [100, "Course title cannot exceed 100 characters"]

    },

    instructor: {
        type: String,
        required: [true, "Instructor name is required"],
        trim: true,
    },

    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
        enum: {
            values: [
                "frontend",
                "backend",
                "database",
                "programming",
                "devops",
                "mobile",
            ]
        },
        message: "Inavalid Category",
    },
    description:{
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 character"],
    },
    price: {
        type: Number,
        required: [true, "Course price is required"],
        min: [0, "Price cannot be negative"],
    },
    duration: {
        type: String,
        required: [true, "Duration is required"],
        trim: true
    },
    level: {
        type: String,
        required: [true, "Course level is required"],
        trim: true,
        enum: {
              
              values: ["beginner" , "intermediate", "advanced"],
              message: "Level must be beginner, intermediate or advanced",  
              
        },
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating must be Positive"],
        max: [5, "Rating can not be greater than 5"],
    },
    students: {
        type: Number,
        default: 0,
        min: [0, "Students Cannot be negative"],
    },
    imageUrl: {
        type: String,
        trim: true,
    }
    
},
{
    timestamps: true,
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;