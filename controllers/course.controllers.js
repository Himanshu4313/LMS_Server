import Course from "../models/course.schema.js";
import cloudinary from "cloudinary";
import { error, log } from "console";
import fs from "fs/promises";
// controller for get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    if (!courses) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong!!.No course are Exists",
      });
    }
    //if course are exists than we send all courses to the user
    res.status(200).json({
      success: true,
      message: "Successfully fetch courses",
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: "Couldn't fetch the courses",
    });
  }
};

//controller fot get all lecture by course id
export const getLecturesByCourseId = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch your course lectures",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successfully get lecture",
      lectures: course.lectures,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong,Please try again.",
    });
  }
};

//controller for create courses
export const createCourse = async (req, res) => {
  const { title, category, createdBy, description } = req.body;

  try {
    if (!title || !category || !createdBy || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are mandatory" });
    }

    const course = await Course.create({
      title,
      category,
      createdBy,
      description,
      thumbnail: {
        public_id: "Dummy",
        secure_url: "Dummy",
      },
    });

    if (!course) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create course." });
    }
    //    console.log(req.file);
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
        console.log(result);
        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        //  throw new Error(error)
        res.status(500).json({
          success: false,
          message: "File not uploaded , Please try again",
          error,
        });
      }
    }

    await course.save();
    res.status(200).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};

//controller for updateCourse
export const updateCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true }
    );

    if (!course) {
      return res.status(400).json({
        sucess: false,
        message:
          "Course is does not exists in database with your given CourseID",
      });
    }

    res.status(200).json({
      sucess: true,
      message: "Course Updated successfully",
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};

//controller for delete course respective with id

export const removeCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(400).json({
        sucess: false,
        message: "Failed to delete Your course.",
      });
    }
    res.status(200).json({
      sucess: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};

//lecture
export const addLecturesByCourseId = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    //course exists or not

    const course = await Course.findById(id);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course does not exists",
      });
    }

    const lectureData = {
      title,
      description,
      lecture: {},
    };

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
        // console.log(result)
        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        //  throw new Error(error)
        res.status(500).json({
          success: false,
          message: "File not uploaded , Please try again",
          error,
        });
      }
    }

    course.lectures.push(lectureData);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture uploaded successfully.",
      lectures: Course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};

//controller for deletelecturebycourseId
export const deleteLectureByCourseId = async (req, res) => {
  const { courseId, lectureId } = req.query;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course Id is required",
    });
  }
  if (!lectureId) {
    return res.status(400).json({
      success: false,
      message: "Lecture Id is required",
    });
  }
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course does not exists with your given Id",
      });
    }
    const lectureIndex = course.lectures.findIndex((lecture) => {
      return lecture._id.toString() === lectureId.toString();
    });
    console.log("Lecture Index", lectureIndex);
    if (lectureIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No any lecture exists in this course",
      });
    }
    try {
      await cloudinary.v2.uploader.destroy(
        course.lectures[lectureIndex].lecture.public_id
      );
    } catch (e) {
      throw new Error(e);
    }

    course.lectures.splice(lectureIndex, 1);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
      lecture: course.lectures,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: "Something went wrong.Please try again",
    });
  }
};
