"use client";

import React from "react";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";
import { Spinner } from "./spinner";

export default function AuthFormBtn({ type }: { type: "login" | "signup" }) {
  const { pending } = useFormStatus();

  return (
    <Button shape="circle" type="submit" disabled={pending}>
      {pending ? (
        <Spinner size="xs" />
      ) : type === "login" ? (
        "Log In"
      ) : (
        "Sign Up"
      )}
    </Button>
  );
}
