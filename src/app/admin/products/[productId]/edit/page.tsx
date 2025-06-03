import { PageHeader } from "@/components/PageHeader";
import React from "react";
import { db } from "@/drizzle/db";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ProductTable as DbProductTable, CourseTable } from "@/drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { getProductIdTag } from "@/features/products/db/cache";
import { notFound } from "next/navigation";
import { ProductForm } from "@/features/products/components/ProductForm";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
const EditProductsPage = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (product == null) return notFound();
  return (
    <div className="container my-6">
      <PageHeader title="Products"></PageHeader>
      <ProductForm
        product={{
          ...product,
          courseIds: product.courseProducts.map((c) => c.courseId),
        }}
        courses={await getCourses()}
      ></ProductForm>
    </div>
  );
};

export default EditProductsPage;

async function getCourses() {
  "use cache";

  cacheTag(getCourseGlobalTag());
  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: {
      id: true,
      name: true,
    },
  });
}

async function getProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      status: true,
      imageUrl: true,
    },
    where: eq(DbProductTable.id, id),
    with: { courseProducts: { columns: { courseId: true } } },
  });
}
