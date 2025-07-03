"use client";
import React from "react";
import { Folder, FolderPlus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useFolders } from "@/app/context/FolderContext";

export function FoldersSidebar() {
  const {
    folders,
    selectedFolder,
    setSelectedFolder,
    editingId,
    handleAdd,
    handleDelete,
    handleEdit,
    handleRename,
  } = useFolders();

  const router = useRouter();
  const pathname = usePathname();

  //console.log(folders);

  // Handle navigation to the selected folder url
  const handleFolderNavigation = (url: string) => {
    if (url) {
      router.push(`/folder/${url}`);
    } else {
      router.push("/folder");
    }
  };

  return (
    <aside className="border-neutral-200 p-0 flex flex-col">
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition"
      >
        <FolderPlus className="w-5 h-5" />
        <span className="font-medium">New folder</span>
      </button>
      <div className="mt-3 flex flex-col gap-1">
        {folders.map((f) => (
          <div
            key={f.id}
            className={`flex items-center gap-3 px-6 py-2 rounded-lg cursor-pointer group ${
              (f.id === selectedFolder || pathname.includes(f.id))
                ? "bg-neutral-200 dark:bg-neutral-700"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            onClick={() => {
              setSelectedFolder(f.id);
              handleFolderNavigation(f.id);
            }}
          >
            {!editingId && <Folder className="w-5 h-5" />}
            {editingId === f.id ? (
              <div className="flex items-center gap-4">
                {/* Input for renaming the folder */}
                <Folder className="w-5 h-5" size={22} />

                <input
                  aria-label="Rename folder"
                  className="bg-transparent border-b border-neutral-400 outline-none w-22"
                  defaultValue={f.name}
                  onBlur={(e) => handleRename(f.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename(f.id, (e.target as HTMLInputElement).value);
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <span
                className="flex-1 font-medium truncate"
                onDoubleClick={() => handleEdit(f.id)}
              >
                {f.name}
              </span>
            )}
            {/* Add a delete button if desired */}
          </div>
        ))}
      </div>
    </aside>
  );
}
