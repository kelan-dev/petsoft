"use client";

import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { logOut } from "@/actions/actions";
import { Spinner } from "./spinner";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      shape="circle"
      disabled={isPending}
      onClick={() => startTransition(async () => logOut())}
    >
      {isPending ? <Spinner size="xs" /> : "Sign Out"}
    </Button>
  );
}
