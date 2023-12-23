import { Schema, model } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title fields are required"],
      minLength: [10, "Title must be atleast 8 character"],
      maxLength: [59, "Title should be less than 60 character"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description fields are required"],
      minLength: [20, "Description must be atleast 8 character"],
      maxLength: [150, "Description should be less than 60 character"],
    },
    category: {
      type: String,
      required: [true, "Category must be required"],
    },
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    lectures: [
      {
        title: String,
        description: String,
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      reuired: true,
    },
  },
  { timestamps: true }
);

const Course = model("Course", courseSchema);

export default Course;
