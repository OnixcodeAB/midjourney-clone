"use client";

import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { updatePublicImage } from "@/app/actions/user/updatePublicImage";
import { getPublicImage } from "./getPublicImage";
import { getUserPlanById } from "@/app/actions/user/getUserPlanById";

interface SettingsAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface Subscription {
  subscription_plan: string;
  plan_id: string;
  // Add other subscription-related fields if they exist
}

interface UserPublicMetadata {
  subscription?: Subscription;
  // Add other public metadata fields if they exist
}

export function SettingsAlertDialog({
  open,
  onOpenChange,
  trigger,
}: SettingsAlertDialogProps) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light"; // Default to light theme if localStorage is not available
  });
  const [improveModel, setImproveModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("improveModel") === "true";
    }
    return true; // Default to true if localStorage is not available
  });
  const [publishExplore, setPublishExplore] = useState<boolean | undefined>();
  const [section, setSection] = useState<"general" | "plan">("general");
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>();

  const { user } = useUser();

  const subscriptionPlanType =
    (user?.publicMetadata as UserPublicMetadata)?.subscription
      ?.subscription_plan || "Basic";

  const subscriptionPlanId =
    (user?.publicMetadata as UserPublicMetadata)?.subscription?.plan_id || "";

  useEffect(() => {
    const fetchPublicImage = async () => {
      if (user?.id) {
        const publicImage = await getPublicImage(user.id);
        setPublishExplore(publicImage);
      }
    };
    const subscriptionPlan = async () => {
      const result = await getUserPlanById(subscriptionPlanId);
      // Check if result has the expected Subscription shape
      if (result) {
        setSubscriptionPlan(result);
      } else {
        setSubscriptionPlan(undefined);
      }
    };

    subscriptionPlan();
    fetchPublicImage();
  }, [user]);

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    // Save improveModel to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem("improveModel", String(improveModel));
    }
  }, [improveModel]);

  const handlePublishExploreChange = async (checked: boolean) => {
    //console.log("handlePublishExploreChange", checked);
    setPublishExplore(checked);
    if (user?.id) {
      const result = await updatePublicImage(user.id, checked);
      if (!result.success) {
        console.error(
          "Failed to update publish explore setting:",
          result.message
        );
      }
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    // The useEffect above will handle saving to localStorage
  };

  const handleImproveModelChange = (checked: boolean) => {
    setImproveModel(checked);
    // The useEffect above will handle saving to localStorage
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-4xl px-3 py-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only">Settings</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Configure your account preferences.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex h-[500px] ">
          {/* Left Sidebar Nav */}
          <aside className="w-48 border-r pr-4">
            <nav className="space-y-1">
              <h1 className="mb-6 border-b pb-2 text-xl">Settings</h1>
              {["general", "plan"].map((key) => (
                <button
                  type="button"
                  aria-label="btn-icon"
                  key={key}
                  className={`flex w-full  items-center px-5 py-2 mb-4 rounded-md text-sm font-medium transition-colors ${
                    section === key
                      ? "bg-gray-100 text-gray-900"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setSection(key as "general" | "plan")}
                >
                  <span className="capitalize text-[15px] font-semibold">
                    {key.replace("plan", "My plan")}
                  </span>
                  {key === "plan" && (
                    <Badge className="ml-4" variant="outline">
                      {subscriptionPlan?.name || "Free"}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content */}
          <section className="w-[78%] ">
            {section === "general" ? (
              <div className=" space-y-6 px-4">
                <h3 className="text-xl font-semibold border-b pb-2">General</h3>
                {/* Username row */}
                <div className="flex justify-between pr-7 items-center border-b pb-3">
                  <label className="text-md font-medium">Username</label>
                  <span className=" text-end pr-18">{user?.username}</span>
                </div>
                {/* Email row */}
                <div className="flex justify-between gap-4 items-center border-b pb-3">
                  <label className="text-md font-medium">Email</label>
                  <span className=" text-sm text-end text-gray-700">
                    {user?.emailAddresses[0]?.emailAddress || "Not set"}
                  </span>
                </div>
                {/* Theme row */}
                <div className="flex justify-between  gap-4 items-center border-b pb-3">
                  <label className="text-md font-medium ">Theme</label>
                  <div className="pr-18">
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className=" col-span-2">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Toggles */}
                <div className="space-y-4 ">
                  <div className="flex items-center gap-26 ">
                    <div className="flex flex-col w-[60%] ">
                      <p className="text-md font-medium">Publish to explore</p>
                      <p className="text-sm text-gray-500">
                        Images you create can be seen by others in the explore
                        feeds. Turning off this setting, does not unpublish
                        images already in the feed.
                      </p>
                    </div>
                    <Switch
                      className="cursor-pointer"
                      checked={publishExplore}
                      onCheckedChange={handlePublishExploreChange}
                    />
                  </div>
                  <hr className="" />

                  <div className="flex items-center  gap-26">
                    <div className="flex flex-col w-[60%]">
                      <p className="text-md font-medium">
                        Improve the model for everyone
                      </p>
                      <p className="text-sm text-gray-500">
                        Allows your content to be used to train our models,
                        which makes Imagen AI Studio better for you and everyone
                        who uses it. We take steps to protect your privacy.
                      </p>
                    </div>
                    <Switch
                      disabled={true}
                      checked={true}
                      onCheckedChange={handleImproveModelChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 px-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  {subscriptionPlan?.name || "Free"}
                </h3>
                {/* Feature row */}
                <div className="flex gap-10 items-start border-b pb-2">
                  <div className="flex flex-col gap-2 w-[60%]">
                    <label className="text-md font-medium">
                      Max concurrent generations
                    </label>
                    <span>
                      Number of generations you can have queued at the same time
                    </span>
                  </div>
                  <span className="col-span-2 text-end pr-18">1</span>
                </div>
              </div>
            )}
          </section>
        </div>
        <AlertDialogFooter className="w-full flex justify-between">
          <div className=" w-full flex justify-between items-center gap-2">
            <AlertDialogAction asChild>
              <Link
                href="/subscription"
                className="p-2 rounded-lg border-2  border-gray-200 hover:bg-gray-100 transition-colorss font-semibold"
              >
                Manage subscription{" "}
              </Link>
            </AlertDialogAction>
            <AlertDialogCancel asChild className="">
              <button type="button" className="btn">
                Done
              </button>
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
