import { PageHeader } from "@/components/PageHeader";
import { CourseForm } from "@/features/courses/components/CourseForm";
import React from "react";

const NewCoursePage = () => {
  return (
    <div className="container my-6">
      <PageHeader title="New Course"></PageHeader>
      <CourseForm></CourseForm>
    </div>
  );
};

export default NewCoursePage;
