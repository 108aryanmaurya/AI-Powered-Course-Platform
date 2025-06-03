import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { getPurchaseUserTag } from "@/features/purchases/db/cache";
import { getCurrentUser } from "@/services/clerk";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import React, { Suspense } from "react";

const PurchasePage = () => {
  return (
    <div className=" container my-6">
      <PageHeader title="Purchase History"></PageHeader>
      <Suspense
        fallback={<UserPurchaseTableSkeleton></UserPurchaseTableSkeleton>}
      >
        <SuspenseBoundary></SuspenseBoundary>
      </Suspense>
    </div>
  );
};

export default PurchasePage;

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();
  const purchases = await getPurchases(userId);
  if (purchases.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-start">
        You have made no purchases yet
        <Button asChild size="lg">
          <Link href={"/"}>Browse Courses</Link>
        </Button>
      </div>
    );
  }
  return <UserPurchaseTable purchases={purchases}></UserPurchaseTable>;
}

async function getPurchases(id: string) {
  "use cache";
  cacheTag(getPurchaseUserTag(id));
  return db.query.PurchaseTable.findMany({
    where: eq(PurchaseTable.userId, id),
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    orderBy: desc(PurchaseTable.createdAt),
  });
}
