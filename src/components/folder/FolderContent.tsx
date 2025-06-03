"use client";

import React, { useState } from "react";
import Masonry from "react-masonry-css";
import ImageCard from "../Home/ImageCard";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Folder,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Star,
  X,
} from "lucide-react";
import { useFolders } from "@/app/context/FolderContext";
import { deleteFolderItem } from "@/app/actions/folders/deleteFolderItem";

// Define responsive breakpoints for masonry
const breakpointCols = {
  default: 3,
  768: 2,
  640: 1,
};

export const FolderContent: React.FC<{
  items: FolderItem[] | null;
  handleDelItem: (id: string, folderId: string) => void;
}> = ({ items, handleDelItem }) => {
  
  const [menuOpen, setMenuOpen] = useState(false);

  const { folders } = useFolders();
  const router = useRouter();

  console.log(items);

  const handleClick = (id: string) => {
    router.push(`/jobs/img_${id}`);
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[79vh]">
        <img
          src="/empty-folder.png"
          alt="Empty folder"
          className="w-75 h-auto object-cover rounded-lg mb-2"
        />
        <p className="text-neutral-400">
          Add images from your library to organize your work
        </p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="flex w-[90%]"
      columnClassName="my-masonry-grid_column"
    >
      {items.map((img) => {
        console.log(img.prompt);
        return (
          <div
            key={img.id}
            /* onClick={() => handleClick(img.id)} */
            className="cursor-pointer relative group"
          >
            {/* Menu contextual arriba a la derecha */}
            <div
              className={
                "absolute top-2 right-2 pr-2 z-20 transition " +
                (!menuOpen
                  ? "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                  : "opacity-100 pointer-events-auto")
              }
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="text"
                    className="cursor-pointer p-1 outline-none border-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-2xl shadow-xl p-2 space-y-1"
                  align="end"
                >
                  <DropdownMenuItem>
                    <Plus className="w-4 h-4 mr-2" /> Select
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="w-4 h-4 mr-2" /> Favorite
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={"url"}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </DropdownMenuItem>
                  {/* Submenú Add to folder */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center">
                      <Folder className="w-4 h-4 mr-2" /> Add to folder
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48 rounded-xl p-1">
                      {folders.length === 0 ? (
                        <span className="px-3 py-2 text-sm text-neutral-400 block">
                          No folders
                        </span>
                      ) : (
                        folders.map((folder) => (
                          <DropdownMenuItem key={folder.id}>
                            {folder.name}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    onClick={() => {
                      handleDelItem(img.id, img.folder_id);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Remove from folder
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LayoutGrid className="w-4 h-4 mr-2" /> View variations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ImageCard
              src={img.url}
              alt={img.image_title}
              prompt={img.prompt}
              showAuthor={false}
              showLike={false}
              showSearch={false}
              handleOnClick={() => handleClick(img.image_id)}
            />

            {/* Prompt overlay on hover */}
            {img.prompt && (
              <div className="absolute bottom-0 left-0  w-full bg-black/50 text-white text-xs px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 truncate ">
                {img.prompt}
              </div>
            )}
          </div>
        );
      })}
    </Masonry>
  );
};
