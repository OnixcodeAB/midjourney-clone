// pages/auth/sign-in.tsx  (or app/auth/sign-in/page.tsx)
import React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[93vh] ">
      <SignIn path="/auth/sign-in" signUpUrl="/auth/sign-up" />
    </div>
  );
}
