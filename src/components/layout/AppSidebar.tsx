"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Bell,
  CircleHelp,
  CircleUserRound,
  Compass,
  Globe,
  PaintbrushVertical,
  SquarePen,
  SwatchBook,
  ThumbsUp,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { BannerModal } from "./BannerModal";
import { UserSettingsMenu } from "../User/UserSettingsMenu";
import { checkOnboardingStatus } from "@/app/actions/db/checkOnboardingStatus";

// Menu items.
const items = [
  { title: "Explore", url: "/", icon: Compass },
  { title: "Create", url: "/create", icon: PaintbrushVertical },
  { title: "Edit", url: "/edit", icon: SquarePen },
  { title: "Personalize", url: "/personalize", icon: SwatchBook },
  { title: "Surveys", url: "/surveys", icon: ThumbsUp },
  { title: "Subscribe", url: "/subscription", icon: CircleUserRound },
];

const itemsFooter = [
  { title: "Help", url: "/help", icon: CircleHelp },
  { title: "Update", url: "/update", icon: Bell },
];

export default function AppSidebar() {
  const [isEditing, setIsEditing] = useState(false);
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  // Handle navigation to the selected URL
  const handleNavigation = async (url: string) => {
    // Always allow navigating to home and login/signup without modal
    if (
      url === "/" ||
      url.startsWith("/auth") ||
      url == "/help" ||
      url == "/subscription" ||
      url == "/update"
    ) {
      setIsEditing(false);
      router.push(url);
      return;
    }
    // For other routes, require authentication
    if (user) {
      const onboardedUser = await checkOnboardingStatus(user.id);
      if (!onboardedUser) {
        // If the user is not onboarded, show the modal
        setIsEditing(true);
        return;
      } else {
        setIsEditing(false);
        router.push(url);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg px-4 mt-5 mb-6">
              Midjourney
            </SidebarGroupLabel>
            <SidebarGroupContent
              className={state === "collapsed" ? "px-0" : "px-4"}
            >
              <SidebarMenu className="gap-3">
                {items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={` rounded-2xl py-5 font-semibold cursor-pointer ${
                          isActive
                            ? "text-[#f25b44] bg-[#f9e8e6]"
                            : "hover:bg-[#abafba]/35"
                        }`}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <a>
                          <item.icon className="size-[22px]!" />
                          <span className="text-[16px] ml-3">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="">
          <SidebarContent className="mb-5">
            <SidebarGroup className="p-0">
              <SidebarGroupContent
                className={state === "collapsed" ? "px-0" : "px-4"}
              >
                <SidebarMenu className="gap-2">
                  {itemsFooter.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="rounded-2xl hover:bg-[#abafba]/25 py-5 cursor-pointer"
                        onClick={() => handleNavigation(item.url)}
                      >
                        <a>
                          <item.icon className="size-[22px]!" />
                          <span className="text-[16px] ml-3">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem className="flex flex-col gap-3">
                    {user ? (
                      <div className="flex items-center justify-between rounded-2xl  hover:bg-[#abafba]/25">
                        <CircleUserRound className="size-[22px] ml-2" />
                        <span className="text-[16px] flex-1 ml-2">
                          {user.fullName}
                        </span>
                        <UserSettingsMenu />
                      </div>
                    ) : (
                      <>
                        <SidebarMenuButton
                          asChild
                          className={
                            state === "collapsed"
                              ? "bg-none"
                              : "rounded-2xl bg-[#abafba]/20 hover:bg-[#abafba]/35 py-5"
                          }
                          onClick={() => handleNavigation("/auth/sign-in")}
                        >
                          <Link href="/auth/sign-in">
                            <CircleUserRound className="size-[22px]!" />
                            <span className="text-[16px] ml-3">Log in</span>
                          </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                          asChild
                          className={` cursor-pointer
                            ${
                              state === "collapsed"
                                ? "bg-none"
                                : "rounded-2xl bg-[#f9e8e6] hover:bg-[#ffd6da] py-5"
                            }
                          `}
                          onClick={() => handleNavigation("#")}
                        >
                          <a className="text-[#f25b44] flex items-center ">
                            <Globe className="size-[22px]! mr-2" />
                            <span className="text-[16px] font-semibold">
                              Sign Up
                            </span>
                          </a>
                        </SidebarMenuButton>
                      </>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </SidebarFooter>
      </Sidebar>
      <BannerModal isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </>
  );
}
