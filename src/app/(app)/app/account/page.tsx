import ContentBlock from "@/components/content-block";
import H1 from "@/components/h1";
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-btn";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main>
      <H1 className="my-8 text-white">Your Account</H1>
      <ContentBlock className="h-[500px] flex items-center justify-center flex-col gap-3">
        <p>Logged in as {session?.user?.email}</p>
        <SignOutButton />
      </ContentBlock>
    </main>
  );
}
