import Pageheader from "@/components/Pageheader";
import { CourseForm } from "@/features/courses/components/CourseForm";
import React from "react";

const NewCoursePage = () => {
  return (
    <div className="container my-6">
      <Pageheader title="New Course"></Pageheader>
      <CourseForm></CourseForm>
    </div>
  );
};

export default NewCoursePage;
