import SocketClient from "@/components/layout/SocketClient";
import { Button } from "@/components/ui/button";
import { canAccessAdminPage } from "@/permissions/general";
import { getCurrentUser } from "@/services/clerk";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

export default function ConsumerLayout({
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
    <header className="flex h-12 shadow bg-background z-10 ">
      {/* <Suspense fallback={<></>}>
        <SocketClient></SocketClient>
      </Suspense> */}
      <nav className="flex gap-4  container">
        <Link
          href={"/"}
          className="mr-auto text-lg hover:underline  flex items-center"
        >
          Course Platform
        </Link>
        <Suspense>
          <SignedIn>
            {" "}
            <AdminLink></AdminLink>
            <Link
              href={"/courses"}
              className="hover:bg-accent/10 px-2 flex items-center"
            >
              My Courses
            </Link>
            <Link
              href={"/purchases"}
              className="hover:bg-accent/10 px-2 flex items-center"
            >
              Purchase history
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: "60%",
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
