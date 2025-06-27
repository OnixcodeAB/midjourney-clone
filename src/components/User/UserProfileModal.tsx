// UserProfileModal.tsx
"use client";

import React from "react";
import { UserProfile } from "@clerk/nextjs";

interface UserProfileModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function UserProfileModal({ open, setOpen }: UserProfileModalProps) {
  if (!open) return null;

  return (
    // Outer modal overlay and backdrop
    <div
      className="fixed inset-0 z-50 bg-[#212121]/50 flex items-center justify-center transition-all transition-discrete " // High z-index for the modal itself
      onClick={() => setOpen(false)} // Close when clicking outside the content
    >
      <div
        className="relative bg-transparent rounded-lg shadow-xl w-[90vw] max-w-4xl p-0 m-0 flex flex-col user-profile-modal-box" // Use flex-col for internal layout
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        {/* Close button - Ensure it's always on top */}
        <button
          type="button"
          className="
            absolute top-4 right-12 
            py-2 px-4 rounded-md 
            hover:bg-gray-200 
            focus:outline-none 
            focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
            z-50 
          "
          aria-label="Close profile"
          onClick={() => setOpen(false)}
        >
          Close
        </button>

        {/* Clerk UserProfile component container */}
        {/* This div will contain Clerk's UI and manage its own scrolling if Clerk's content overflows */}
        <div className="flex-grow w-full overflow-y-auto ">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  );
}
