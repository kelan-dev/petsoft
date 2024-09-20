import Logo from "@/components/logo";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col gap-2">
      <Logo />
      {children}
    </div>
  );
}
