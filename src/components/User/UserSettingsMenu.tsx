// UserSettingsMenu.tsx
"use client";

import React, { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Ellipsis, Settings, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { UserProfileDialog } from "./UserProfileDialog";

export function UserSettingsMenu() {
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        dir="rtl"
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Open user settings"
          >
            <Ellipsis className="size-[22px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={4} className="w-48">
          {/* 1) PROFILE item */}
          <DropdownMenuItem asChild>
            <button
              className="flex items-center gap-2 py-2 w-full text-left hover:bg-gray-100 rounded"
              onClick={() => {
                // close dropdown first, then open dialog
                setDropdownOpen(false);
                setProfileOpen(true);
              }}
            >
              <UserIcon className="size-[18px]" />
              Profile
            </button>
          </DropdownMenuItem>

          {/* 2) SETTINGS link */}
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings className="size-[18px]" />
              Settings
            </Link>
          </DropdownMenuItem>

          {/* 3) SIGN OUT */}
          <DropdownMenuItem asChild>
            <button
              className="w-full text-left flex items-center gap-2 py-2 hover:bg-gray-100 rounded"
              onClick={() => {
                setDropdownOpen(false);
                signOut({ redirectUrl: "/" });
              }}
            >
              <LogOut className="size-[18px]" />
              Sign Out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 4) PROFILE DIALOG */}
      <UserProfileDialog open={profileOpen} setOpen={setProfileOpen} />
    </>
  );
}
