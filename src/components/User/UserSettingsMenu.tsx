// UserSettingsMenu.tsx
"use client";

import React, { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Ellipsis, Settings, LogOut, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { SettingsAlertDialog } from "./SettingsAlertDialog";
import { UserProfileModal } from "./UserProfileModal";

export function UserSettingsMenu() {
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsAlertOpen, setSettingsAlertOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        dir="rtl"
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-2 rounded cursor-pointer"
            aria-label="Open user settings"
          >
            <Ellipsis className="size-[22px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={4} className="w-48">
          {/* 1) PROFILE item */}
          <DropdownMenuItem asChild>
            <button
              type="button"
              aria-label="Open user profile"
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
            <button
              type="button"
              aria-label="Open user settings"
              className="flex items-center gap-2 py-2 w-full hover:bg-gray-100 rounded"
              onClick={() => {
                setDropdownOpen(false);
                setSettingsAlertOpen(true);
              }}
            >
              <Settings className="size-[18px]" />
              Settings
            </button>
          </DropdownMenuItem>

          {/* 3) SIGN OUT */}
          <DropdownMenuItem asChild>
            <button
              type="button"
              aria-label="Sign out"
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
      <UserProfileModal open={profileOpen} setOpen={setProfileOpen} />
      

      {/* 5) SETTINGS DIALOG */}
      <SettingsAlertDialog
        open={settingsAlertOpen}
        onOpenChange={setSettingsAlertOpen}
      />
    </>
  );
}
