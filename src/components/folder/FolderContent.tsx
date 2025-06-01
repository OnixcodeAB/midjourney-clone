import Image from "next/image";
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center bg-white rounded-lg shadow-md p-4"
        >
          <Image
            src={`${item.url}`}
            alt={item.image_title}
            width={400}
            height={300}
            className="w-full h-auto object-cover rounded-lg mb-2"
          />
          <h3 className="text-lg font-semibold">{item.image_title}</h3>
        </div>
      ))}
    </div>
  );
};
