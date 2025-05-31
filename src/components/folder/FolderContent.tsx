import React from "react";

export const FolderContent: React.FC<{ items: FolderItem[] | null }> = ({
  items,
}) => {
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

  return;
};
