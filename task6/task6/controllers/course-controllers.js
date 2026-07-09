const Course= require("../models/course-model");

;
const getAllCourses =async(req,res)=>{

    try{
    const courses = await Course.find();
    res.status(200).json({
        status: "success",
        count: courses.length,
        data: { courses }
    });
}
    catch(error){
        res.status(400).json({
            status: "error",
            message: `Failed to fetch courses ${error.message}`,
        })
    }
}


const createCourse = async(req, res)=>{
   
    try{
    const category = req.body.category?.toLowerCase();
    const level =req.body.level?.toLowerCase();

    const course = await Course.create({
        ...req.body,
        category,
        level,
    });
    res.status(201).json({
        status: "success",
        message: "Course added successfully",
        data: { course },
    });
    }catch(error){
        res.status(400).json({ status: "error", message: `${error.message}`});
    }
}

const getCourseByID = async(req,res) => {

    try{

    const course = await Course.findById(req.params.id);
    if (!course){
        res.status(404).json({
            status: "Fail",
            message: "Course Not Found",
        });
    }
    res.status(200).json({
        status: "success",
        data: { course },
    });
    }catch(error){
        return res.status(404).json({
            status: "error",
            message: "Course not found"
        });
    }
}
 

const updateCourse = async(req,res)=>{
    try{
        if (req.body.category){
            req.body.category = req.body.category.toLowerCase();
        }
        if (req.body.level){
            req.body.level = req.body.level.toLowerCase();
        }
        const updatedcourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );
        if (!updatedcourse){
            return res.status(404).json({
                status: "error",
                message: "Course Not Found",
            });
        }

        res.status(200).json({
            status: "success",
            data: { updatedcourse },
        })
    }catch(error){
        res.status(404).json({
            status: "error",
            message: `Error Found ${error.message}`,
        })
    }
}
  

const deleteCourse = async(req,res)=>{
    try{
        if (req.body.category){
            req.body.category = req.body.category.toLowerCase();
        }
        if (req.body.level){
            req.body.level = req.body.level.toLowerCase();
        }
    const deletedCourse = await Course.findByIdAndDelete(req.params.id)

        if(!deletedCourse){
            return res.status(404).json({status: "Fail", message: "Course Not Found"});
        }

        res.status(200).json({
            status: "success",
            message: "Course deleted Successfully",
            data: { course: deleteCourse}
        });
    }   catch(error){
            res.status(404).json({
                status: "error",
                message: `error in deleteting course: ${error.message}`,
            });
    }}
    

module.exports = { getAllCourses, getCourseByID, createCourse, updateCourse, deleteCourse};