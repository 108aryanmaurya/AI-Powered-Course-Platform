// import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductIdTag } from "@/features/products/db/cache";
// import { getUserOwnsProduct } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { getCurrentUser } from "@/services/clerk";
import StripeCheckoutForm from "@/services/stripe/components/StripeCheckoutForm";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";
// const AuthGate = dynamic(
//   () => import("@/features/purchases/components/AuthGate")
// );

function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  return (
    <></>
    // <Suspense fallback={<LoadingSpinner className="my-6 size-36 mx-auto" />}>
    //   <SuspendedComponent
    //     params={params}
    //     searchParams={searchParams}
    //   ></SuspendedComponent>
    // </Suspense>
  );
}

export default PurchasePage;

async function SuspendedComponent({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);
  const { user } = await getCurrentUser({ allData: true });

  if (product == null) return notFound();
  console.log(user);
  if (user != null) {
    // if (await getUserOwnsProduct({ productId, userId: user.id })) {
    //   redirect("/courses");
    // }

    return (
      <div className="container my-6">
        <StripeCheckoutForm product={product} user={user}></StripeCheckoutForm>
      </div>
    );
  }
  const { authMode } = await searchParams;

  const isSignUp = authMode === "signUp";

  return (
    <div className="container my-6 flex flex-col items-center">
      <PageHeader title="You need a account to purchase"></PageHeader>
      {/* <AuthGate isSignUp={isSignUp} productId={productId}></AuthGate> */}
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    where: and(eq(ProductTable.id, id), wherePublicProducts),
    columns: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
  });
}
