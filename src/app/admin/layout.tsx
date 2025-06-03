import SocketClient from "@/components/layout/SocketClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canAccessAdminPage } from "@/permissions/general";
import { getCurrentUser } from "@/services/clerk";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar></Navbar>
      {children}
    </>
  );
}
function Navbar() {
  return (
    <header className="flex h-12 shadow bg-background z-10  py-10 ">
      {/* <Suspense fallback={<></>}>
        <SocketClient></SocketClient>
      </Suspense> */}
      <nav className="flex gap-4  container">
        <div className="mr-auto flex items-center gap-2">
          <Link href={"/"} className="text-lg hover:underline  ">
            Course Platform
          </Link>
          <Badge>Admin</Badge>
        </div>
        <Suspense>
          <SignedIn>
            {" "}
            <AdminLink></AdminLink>
            <Link
              href={"/admin/courses"}
              className="hover:bg-accent/10 px-2 flex items-center"
            >
              Courses
            </Link>
            <Link
              href={"/admin/products"}
              className="hover:bg-accent/10 px-2 flex items-center"
            >
              Products
            </Link>
            <Link
              href={"/admin/sales"}
              className="hover:bg-accent/10 px-2 flex items-center"
            >
              Sales{" "}
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: "80%",
                    height: "80%",
                  },
                },
              }}
            />
          </SignedIn>
        </Suspense>
        <Suspense>
          <SignedOut>
            <Button className="self-center" asChild>
              {/* <Link href={"/sign-in"}> */}
              <SignInButton />
              {/* </Link>{" "} */}
            </Button>
          </SignedOut>
        </Suspense>
      </nav>
    </header>
  );
}

async function AdminLink() {
  const user = await getCurrentUser();
  if (!canAccessAdminPage(user)) return null;
  return (
    <Link
      href={"/courses"}
      className="hover:bg-accent/10 px-2 flex items-center"
    >
      Admin
    </Link>
  );
}
