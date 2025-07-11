"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
} from "react";
import { addFolder } from "@/app/actions/folders/addFolder";
import { renameFolder } from "@/app/actions/folders/renameFolder";
import { useUser } from "@clerk/nextjs";
import { deleteFolder } from "../actions/folders/deleteFolder";

// --- Types
export type FolderType = {
  id: string;
  name: string;
  items: { id: string; url: string; type: "image" | "video" }[];
};

type FolderContextType = {
  folders: FolderType[];
  selectedFolder: string | undefined;
  editingId: string | null;
  setSelectedFolder: (id: string) => void;
  setEditingId: (id: string | null) => void;
  handleAdd: () => void;
  handleRename: (id: string, name: string) => void;
  handleDelete: (id: string) => void;
  handleEdit: (id: string) => void;
  FetchFolders: () => void;
};

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    undefined
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();

  // Fetch all folders
  const FetchFolders = React.useCallback(async () => {
    try {
      const response = await fetch("/api/folder");
      if (!response.ok) throw new Error("Failed to fetch folders");
      const data: FolderType[] = await response.json();
      setFolders(data);
      if (data.length > 0 && !selectedFolder) {
        setSelectedFolder(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, [selectedFolder]);

  useEffect(() => {
    if (user) {
      FetchFolders();
      // eslint-disable-next-line
    }
  }, [user]);

  // Add folder
  const handleAdd = () => {
    startTransition(async () => {
      try {
        const newFolder = await addFolder("New Folder");
        setFolders((folders) => [...folders, newFolder]);
        setSelectedFolder(newFolder.id);
        setEditingId(newFolder.id);
      } catch (error) {
        console.error("Error creating folder:", error);
      }
    });
  };

  // Rename folder
  const handleRename = (id: string, newName: string) => {
    if (!newName || newName.trim() === "") {
      console.error("Folder name cannot be empty");
      return;
    }
    startTransition(async () => {
      try {
        const updatedFolder = await renameFolder(id, newName);
        setFolders((folders) =>
          folders.map((folder) =>
            folder.id === id ? { ...folder, name: updatedFolder.name } : folder
          )
        );
        setEditingId(null);
      } catch (error) {
        console.error("Error renaming folder:", error);
      }
    });
  };

  // Delete folder
  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteFolder(id);
        setFolders((folders) => folders.filter((f) => f.id !== id));
        if (selectedFolder === id && folders.length > 1) {
          setSelectedFolder(folders[0].id);
        }
      } catch (error) {
        console.error("Error deleting folder:", error);
      }
    });
  };

  // Edit mode for rename
  const handleEdit = (id: string) => setEditingId(id);

  return (
    <FolderContext.Provider
      value={
        {
          folders,
          selectedFolder,
          editingId,
          setSelectedFolder,
          setEditingId,
          handleAdd,
          handleRename,
          handleDelete,
          handleEdit,
          FetchFolders,
        } as FolderContextType
      }
    >
      {children}
    </FolderContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (!context)
    throw new Error("useFolders must be used inside FolderProvider");
  return context;
}
