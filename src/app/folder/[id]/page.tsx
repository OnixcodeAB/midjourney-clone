"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useFolders } from "@/app/context/FolderContext";

interface FolderContentPageProps {
  params: Promise<{ id: string }>;
}

export default function FolderContentPage({ params }: FolderContentPageProps) {
  const { folders, handleRename, handleDelete, editingId } = useFolders();
  const [FolderItem, setFolderItem] = React.useState<FolderItem[] | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const { id } = React.use(params);

  // Encuentra la carpeta actual
  const folder = folders.find((f) => f.id === id);

  // Estado local para el input
  const [renameValue, setRenameValue] = React.useState(folder?.name ?? "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cuando cambia de carpeta o sale de edición, resetea el input
  React.useEffect(() => {
    setRenameValue(folder?.name ?? "");
    setIsEditing(false);
  }, [folder?.name, folder?.id]);

  // Auto-focus & select al entrar en modo edición
  React.useEffect(() => {
    if (editingId === folder?.id && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  React.useEffect(() => {
    const fetchFolder = async () => {
      try {
        const response = await fetch(`/api/folder/${id}`);
        if (!response.ok) throw new Error("Failed to fetch folder");
        const data = await response.json();
        setFolderItem(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching folder:", error);
        setFolderItem([]);
      }
    };
    if (id) fetchFolder();
  }, [id]);

  if (!folder) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div>Loading...</div>
      </main>
    );
  }

  // Enviar el rename solo si cambió el nombre y no está vacío
  const finishRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== folder.name) {
      handleRename(folder.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-4">
      {/* Header */}
      <div className="flex  gap-4 mb-8 w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            aria-label="Rename folder"
            className="text-xl font-semibold bg-transparent border-b border-neutral-400 outline-none w-48"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={finishRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishRename();
              if (e.key === "Escape") {
                setRenameValue(folder.name); // Cancela
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <span
            className="font-semibold text-xl"
            // Mejor usar el menú, pero si quieres doble click, descomenta esto:
            // onDoubleClick={() => handleEdit(folder.id)}
          >
            {folder.name}
          </span>
        )}
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
              onClick={() => {
                setMenuOpen(false);
                setTimeout(() => setIsEditing(true), 10);
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
                handleDelete(folder.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </div>
      {/* Folder Content */}
      {!FolderItem || FolderItem.length === 0 ? (
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
        <div className="flex flex-wrap gap-3">
          {/* Render thumbnails for items */}
          {FolderItem.map((item) =>
            item.type === "image" ? (
              <img
                key={item.id}
                src={item.url}
                alt={item.image_title || ""}
                className="w-24 h-24 object-cover rounded-lg mb-2"
              />
            ) : (
              <video
                key={item.id}
                src={item.url}
                controls
                className="w-24 h-24 object-cover rounded-lg mb-2"
              />
            )
          )}
        </div>
      )}
    </main>
  );
}
