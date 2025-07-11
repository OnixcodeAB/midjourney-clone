"use client";

import { deleteFolderItem } from "@/app/actions/folders/deleteFolderItem";
import { useFolders } from "@/app/context/FolderContext";
import { FolderContent } from "@/components/folder/FolderContent";
import { FolderHeader } from "@/components/folder/FolderHeader";
import React from "react";

interface FolderContentPageProps {
  params: Promise<{ id: string }>;
}

export default function FolderContentPage({ params }: FolderContentPageProps) {
  const { folders, handleRename, handleDelete, editingId } = useFolders();
  const [folderItems, setFolderItems] = React.useState<FolderItem[] | null>(
    null
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { id } = React.use(params);
  const folder = folders.find((f) => f.id === id);

  const handleDelItem = async (id: string, FolderId: string) => {
    const result = await deleteFolderItem(id, FolderId);
    if (result.error) {
      // Handle error
      console.error("Error deleting item to folder:", result.error);
    } else {
      // Remove from local state
      setFolderItems((prev) =>
        prev ? prev.filter((item) => item.id !== id) : []
      );
    }
  };

  React.useEffect(() => {
    setRenameValue(folder?.name ?? "");
    setIsEditing(false);
  }, [folder?.name, folder?.id]);

  React.useEffect(() => {
    if (editingId === folder?.id && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  React.useEffect(() => {
    const fetchFolderItems = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/folder/${id}`);
        if (!response.ok) throw new Error("Failed to fetch folder");
        const data = await response.json();

        setFolderItems(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching folder:", error);
        setFolderItems([]);
      }
    };

    fetchFolderItems();
  }, [id]);

  const finishRename = () => {
    if (!folder) return;

    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== folder.name) {
      handleRename(folder.id, trimmed);
    }
    setIsEditing(false);
  };

  if (!folder && !folderItems) {
    return (
      <main className="h-[97vh] flex-1 flex flex-col items-center justify-center p-4">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-4">
      {folder && (
        <FolderHeader
          folder={folder}
          isEditing={isEditing}
          renameValue={renameValue}
          onRenameChange={setRenameValue}
          onFinishRename={finishRename}
          onStartEditing={() => setIsEditing(true)}
          onDelete={() => handleDelete(folder.id)}
          inputRef={inputRef}
        />
      )}
      <FolderContent items={folderItems} handleDelItem={handleDelItem} />
    </main>
  );
}
