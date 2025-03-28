import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Image, SlidersHorizontal } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky inset-0  z-50 bg-[#fcfcfd] flex h-16 items-center gap-2 px-4 ">
      {/* <SidebarTrigger className="-ml-1" /> */}
      <div className="w-full mt-4 flex items-center border-2 rounded-lg px-2 shadow-lg ">
        <Image className="text-gray-400 size-6" />
        <Input
          className="w-full h-12 border-none! outline-none! focus:outline-none focus-visible:ring-0 placeholder:text-[15px] placeholder:text-gray-400"
          placeholder="Log in to start creating.."
        />
        <SlidersHorizontal className="text-gray-400 size-6" />
      </div>
    </header>
  );
}
