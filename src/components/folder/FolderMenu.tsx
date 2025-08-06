import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export const FolderMenu: React.FC<{
  onRename: () => void;
  onDelete: () => void;
}> = ({ onRename, onDelete }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
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
        className="p-2 w-48 rounded-2xl shadow-xl bg-background border border-border"
      >
        <button
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
          onClick={() => {
            setMenuOpen(false);
            setTimeout(onRename, 10);
          }}
        >
          <Pencil className="w-4 h-4" />
          Rename
        </button>
        <button
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 transition text-left mt-1"
          onClick={() => {
            setMenuOpen(false);
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
};
