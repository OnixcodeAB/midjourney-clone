// UserProfileDialog.tsx
"use client";

import React from "react";
import { UserProfile } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface UserProfileDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function UserProfileDialog({ open, setOpen }: UserProfileDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Make this container position:relative */}
      <AlertDialogContent className="w-[90vw] max-w-4xl bg-transparent p-0 m-0">
        {/* Move your close button into the top right via absolute positioning */}
        <AlertDialogCancel asChild>
          <button
            type="button"
            className="
              absolute top-8 right-12 
              p-1 rounded-full 
              hover:bg-gray-200 
              focus:outline-none 
              focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
              z-10
            "
            aria-label="Close profile"
          >
            Close
          </button>
        </AlertDialogCancel>

        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only hidden">User Profile</AlertDialogTitle>
          <AlertDialogDescription className="pb-4 hidden">
            Manage your account settings below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="">
          <UserProfile routing="hash" />
        </div>

        <AlertDialogFooter className="hidden" />
      </AlertDialogContent>
    </AlertDialog>
  );
}
