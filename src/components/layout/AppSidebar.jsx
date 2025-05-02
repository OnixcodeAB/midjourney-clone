"use client";
import { usePathname } from "next/navigation";
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
  Ellipsis,
  Globe,
  Image,
  PaintbrushVertical,
  SquarePen,
  Sun,
  SwatchBook,
  ThumbsUp,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Explore",
    url: "/",
    icon: Compass,
  },
  {
    title: "Create",
    url: "/create",
    icon: PaintbrushVertical,
  },
  {
    title: "Edit",
    url: "/edit",
    icon: SquarePen,
  },
  {
    title: "Personalize",
    url: "/personalize",
    icon: SwatchBook,
  },
  {
    title: "Organize",
    url: "/organize",
    icon: Image,
  },
  {
    title: "Surveys",
    url: "/surveys",
    icon: ThumbsUp,
  },
];

const itmesFooter = [
  {
    title: "Help",
    url: "#",
    icon: CircleHelp,
  },
  {
    title: "Update",
    url: "#",
    icon: Bell,
  },
  {
    title: "Light Mode",
    url: "#",
    icon: Sun,
  },
];
export default function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  console.log(user)

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg px-4 mt-5 mb-6">
            Midjurney
          </SidebarGroupLabel>
          <SidebarGroupContent
            className={`${state === "collapsed" ? "px-0" : "px-4"}`}
          >
            <SidebarMenu className="gap-3">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                      rounded-2xl py-5 font-semibold
                      ${
                        isActive && state === "collapsed"
                          ? " text-[#f25b44] hover:text-[#f25b44] hover:bg-[#f9e8e6]"
                          : isActive
                          ? "bg-[#f9e8e6] text-[#f25b44] hover:text-[#f25b44] hover:bg-[#f9e8e6]" // No background hover when collapsed
                          : "hover:bg-[#abafba]/25"
                      }
                    `}
                    >
                      <a href={item.url}>
                        <item.icon className="size-[22px]!" />
                        <span className="text-[16px]">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarContent className="mb-5">
          <SidebarGroup>
            <SidebarGroupContent
              className={`${state === "collapsed" ? "px-0" : "px-4"}`}
            >
              <SidebarMenu className="gap-2">
                {itmesFooter.map((item) => (
                  <SidebarMenuItem key={item.title} className=" ">
                    <SidebarMenuButton
                      asChild
                      className="rounded-2xl hover:bg-[#abafba]/25 py-5"
                    >
                      <a href={item.url} className="">
                        <item.icon className="size-[22px]!" />
                        <span className="text-[16px]">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem className="flex flex-col gap-3">
                  <SidebarMenuButton
                    asChild
                    className={`${
                      state === "collapsed"
                        ? "bg-none"
                        : "rounded-2xl bg-[#abafba]/20 hover:bg-[#abafba]/35  py-5"
                    }`}
                  >
                    {user && (
                      <a
                        href="#"
                        className="pe-4 flex items-center justify-between"
                        onClick={async () => {
                          await signOut({ redirectUrl: "/" });
                        }}
                      >
                        <CircleUserRound className="size-[22px]! " />
                        <span className="text-[16px]">{user.fullName}</span>
                        <Ellipsis className="size-[22px]" />
                      </a>
                    )}
                  </SidebarMenuButton>
                  {!user && (
                    <>
                      <SidebarMenuButton
                        asChild
                        className={`${
                          state === "collapsed"
                            ? "bg-none"
                            : "rounded-2xl bg-[#abafba]/20 hover:bg-[#abafba]/35  py-5"
                        }`}
                      >
                        <Link href="/auth/sign-in" className="">
                          <CircleUserRound className="size-[22px]! " />
                          <span className="text-[16px] ml-5">Log in</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuButton
                        asChild
                        className={`${
                          state === "collapsed"
                            ? "bg-none"
                            : "rounded-2xl bg-[#f9e8e6] hover:bg-[#ffd6da] py-5"
                        }`}
                      >
                        <a
                          href="#"
                          className=" text-[#f25b44] hover:text-[#f25b44]!"
                        >
                          <Globe className="size-[22px]! mr-6" />
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
  );
}
