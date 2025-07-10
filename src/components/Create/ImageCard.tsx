"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DonutLoader } from "./DonutLoader ";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Star,
  Plus,
  Download,
  Folder,
  LayoutGrid,
  X,
} from "lucide-react";
import { useFolders } from "@/app/context/FolderContext";
import { addFolderItem } from "@/app/actions/folders/addFolderItem";

interface ImageCardProps {
  id: string;
  url: string;
  search_text?: string;
  prompt?: string;
  status?: "pending" | "complete" | "running";
  progress_pct?: number;
  blurUrl?: string;
}

const ImageCard = ({
  id,
  url,
  search_text,
  prompt,
  status = "pending",
  progress_pct,
  blurUrl,
}: ImageCardProps) => {
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const router = useRouter();
  const { folders } = useFolders();

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) setLoaded(true);
  }, []);

  const handleClick = () => {
    router.push(`/jobs/create_${id}`);
  };

  const handleAddItem = async (
    FolderId: string,
    itemData: {
      image_id: string;
      image_title: string;
      prompt: string;
      url: string;
      type: string;
    }
  ) => {
    const result = await addFolderItem(FolderId, itemData);

    if (result.error) {
      // Handle error
      console.error("Error adding item to folder:", result.error);
    } else {
      // Handle success
      console.log("Item added successfully:", result.item);
    }
  };

  return (
    <div
      className="relative sm:w-fit lg:w-50 border border-gray-300 overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Menu contextual arriba a la derecha */}
      <div
        className={
          "absolute top-2 right-2 pr-2 z-30 transition " +
          (!menuOpen
            ? "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
            : "opacity-100 pointer-events-auto")
        }
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="text"
              className="cursor-pointer p-1 outline-none border-none"
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
                href={url}
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
                    <DropdownMenuItem
                      key={folder.id}
                      onClick={() =>
                        handleAddItem(folder.id, {
                          image_id: id,
                          image_title: search_text || "Untitled",
                          prompt: prompt || "",
                          url: url,
                          type: "image",
                        })
                      }
                    >
                      {folder.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem>
              <LayoutGrid className="w-4 h-4 mr-2" /> View variations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* ... el resto del código igual ... */}
      {status === "pending" || status === "running" ? (
        <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center z-10">
          <DonutLoader
            progress={progress_pct ?? 10}
            size={60}
            strokeWidth={5}
            color="blue"
            spin={true}
          />
          <p className="mt-2 text-xs text-gray-600">Generating...</p>
        </div>
      ) : (
        <>
          {!loaded && (
            <div className="absolute inset-0 z-10 bg-[linear-gradient(110deg,#e5e7eb_25%,#f3f4f6_50%,#e5e7eb_75%)] bg-[length:200%_100%] animate-shimmer" />
          )}
          <img
            ref={imgRef}
            src={url}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", url)}
            alt={`Image ${id}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`aspect-square object-cover l transition duration-700 ease-in-out ${
              loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
            }`}
            style={{
              backgroundImage: blurUrl ? `url(${blurUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </>
      )}
      {/* Prompt overlay on hover */}
      {prompt && (
        <div className="absolute bottom-0 left-0  w-full bg-black/50 text-white text-xs px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 truncate ">
          {prompt}
        </div>
      )}
    </div>
  );
};

export default ImageCard;
