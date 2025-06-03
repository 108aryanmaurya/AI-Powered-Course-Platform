import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductIdTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductPurchaseSuccessPage = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const { productId } = await params;
  const product = await getPublicProduct(productId);
  if (product == null) return;

  return (
    <div className=" container my-6">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex flex-col gap-4 items-start ">
          <div className="text-3xl font-semibold ">Succcessful</div>
          <div className="text-xl ">
            Thank ypu for purchasing ${product.name}.
          </div>
          <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
            <Link href={"/courses"}>View My Courses</Link>
          </Button>
        </div>
        <div className="relative aspect-video max-w-lg flex-grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain rounded-xl"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseSuccessPage;
async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));
  return await db.query.ProductTable.findFirst({
    where: and(wherePublicProducts, eq(ProductTable.id, id)),
    columns: {
      name: true,
      imageUrl: true,
    },
  });
}
