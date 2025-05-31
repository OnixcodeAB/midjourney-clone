import React, { use } from "react";
import { Folder, FolderPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export type FolderType = {
  id: string;
  name: string;
  items: { id: string; url: string; type: "image" | "video" }[];
};

interface SidebarProps {
  folders: FolderType[];
  selectedFolder: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  editingId: string | null;
  onRename: (id: string, name: string) => void;
}

export function FoldersSidebar({
  folders,
  selectedFolder,
  onSelect,
  onAdd,
  onDelete,
  onEdit,
  editingId,
  onRename,
}: SidebarProps) {
  // Router for navigation
  const router = useRouter();

  // Handle navigation to the selected folder url
  const handleFolderNavigation = (url: string) => {
    if (url) {
      router.push(`/folder/${url}`);
    } else {
      router.push("/folder");
    }
  };

  return (
    <aside className="  border-neutral-200 bg-neutral-50 dark:bg-neutral-800 p-0 flex flex-col ">
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
      >
        <FolderPlus className="w-5 h-5" />
        <span className="font-medium">New folder</span>
      </button>
      <div className="mt-3 flex flex-col gap-1">
        {folders.map((f) => (
          <div
            key={f.id}
            className={`flex items-center gap-3 px-6 py-2 rounded-lg cursor-pointer group ${
              f.id === selectedFolder
                ? "bg-neutral-200 dark:bg-neutral-700"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            onClick={() => {
              onSelect(f.id);
              handleFolderNavigation(f.id);
            }}
          >
            <Folder className="w-5 h-5" />
            {editingId === f.id ? (
              <input
                aria-label="Rename folder"
                className="bg-transparent border-b border-neutral-400 outline-none w-32"
                defaultValue={f.name}
                onBlur={(e) => onRename(f.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onRename(f.id, (e.target as HTMLInputElement).value);
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                className="flex-1 text-sm truncate"
                onDoubleClick={() => onEdit(f.id)}
              >
                {f.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
