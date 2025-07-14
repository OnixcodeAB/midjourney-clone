import { Download, Heart, PenLine } from "lucide-react";
import React, { useState } from "react";

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
  const baseColor = "text-muted-foreground hover:text-foreground";
  const heartColor = liked 
    ? "text-destructive" 
    : "text-muted-foreground hover:text-destructive";

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
