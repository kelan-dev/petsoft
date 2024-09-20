"use client";

import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { logIn, signUp } from "@/actions/actions";
import AuthFormBtn from "./auth-form-btn";
import { useFormState } from "react-dom";

export default function AuthForm({ type }: { type: "login" | "signup" }) {
  const [signUpError, dispatchSignUp] = useFormState(signUp, null);
  const [logInError, dispatchLogIn] = useFormState(logIn, null);

  return (
    <form action={type === "login" ? dispatchLogIn : dispatchSignUp}>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="test@test.com"
          required
          maxLength={100}
        />
      </div>
      <div className="space-y-1 mb-4 mt-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="password"
          required
          maxLength={100}
        />
      </div>
      <AuthFormBtn type={type} />
      {signUpError && (
        <p className="text-red-500 mt-2 text-sm">{signUpError.message}</p>
      )}
      {logInError && (
        <p className="text-red-500 mt-2 text-sm">{logInError.message}</p>
      )}
    </form>
  );
}
