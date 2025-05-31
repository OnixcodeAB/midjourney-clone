"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface FolderContentPageProps {
  params: Promise<{ id: string }>;
}

export default function FolderContentPage({ params }: FolderContentPageProps) {
  const [folder, setFolder] = React.useState<FolderItem[] | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const { id } = React.use(params);

  React.useEffect(() => {
    const fetchFolder = async () => {
      try {
        const response = await fetch(`/api/folder/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch folder");
        }
        const data = await response.json();
        console.log(data);
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setFolder(data);
        } else {
          // If the API returns a single object, wrap it in an array
          setFolder([data]);
          // Or if the API returns an object with an items property:
          // setFolder(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching folder:", error);
        setFolder([]); // Set to empty array on error
      }
    };

    if (id) {
      fetchFolder();
    }
  }, [id]);

  // --- handlers (example) ---
  const handleRename = () => {
    // Trigger rename logic/modal here
    alert("Rename clicked!");
    setMenuOpen(false);
  };

  const handleDelete = () => {
    // Trigger delete logic/modal here
    alert("Delete clicked!");
    setMenuOpen(false);
  };

  const folderName = folder?.name || "Untitled folder";

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 w-full ">
        <span className="font-semibold text-xl">{folderName}</span>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="More options"
              className="cursor-pointer transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="p-2 w-48 rounded-2xl shadow-xl bg-white dark:bg-neutral-900"
          >
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
              onClick={handleRename}
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 transition text-left mt-1"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </div>
      {folder === null ? (
        // Loading state
        <div>Loading...</div>
      ) : folder.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[79vh]">
          <img
            src="/empty-folder.png"
            alt="empty-folder.png"
            className="w-75 h-auto object-cover rounded-lg mb-2"
          />
          <p className="text-neutral-400">
            Add images from your library to organize your work
          </p>
        </div>
      ) : (
        <div>
          {/* Here you can render thumbnails for items */}
          {folder.map((item) => (
            <img
              key={item.id}
              src={item.url}
              alt={item.image_title || ""}
              className="w-24 h-24 object-cover rounded-lg mb-2"
            />
          ))}
        </div>
      )}
    </main>
  );
}
