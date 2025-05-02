import { SignUp } from "@clerk/nextjs";
import React from "react";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[93vh] ">
      <SignUp path="/auth/sign-up" signInUrl="/auth/sign-in" />
    </div>
  );
}
