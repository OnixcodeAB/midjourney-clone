import { Download, Heart, PenLine } from "lucide-react";
import React, { useState } from "react";
import EditModal from "../Edit/Editmodal";

interface Props {
  ImgSrc: string;
  alt: string;
  theme?: "light" | "dark";
  onEdit?: () => void; // 👈 new
}

export const PanelControl = ({
  ImgSrc,
  alt,
  theme = "dark",
  onEdit,
}: Props) => {
  const [liked, setLiked] = useState(false);
  const baseColor =
    theme === "light"
      ? "text-gray-600 hover:text-black"
      : "text-white hover:text-gray-200";
  const heartColor = liked
    ? "text-red-500"
    : theme === "light"
    ? "text-gray-600 hover:text-red-500"
    : "text-white hover:text-red-400";

  return (
    <div className="flex gap-4">
      <button
        title="Download"
        onClick={() => {
          const link = document.createElement("a");
          link.href = ImgSrc;
          link.download = `${alt || "image"}.jpg`;
          link.click();
        }}
        className="cursor-pointer"
      >
        <Download className={`${baseColor} size-5`} />
      </button>
      <button title="Edit" className="cursor-pointer" onClick={onEdit}>
        <PenLine className={`${baseColor} size-5`} />
      </button>
      <button
        title="Add to Favorites"
        onClick={() => setLiked(!liked)}
        className="cursor-pointer"
      >
        <Heart
          className={`${heartColor} size-5 transition-colors`}
          fill={liked ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
};
