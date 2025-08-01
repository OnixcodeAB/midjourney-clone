import { on } from "events";
import { Download, Heart, PenLine } from "lucide-react";
import React, { useState } from "react";

interface Props {
  ImgSrc: string;
  alt: string;
  theme?: "light" | "dark";
  onEdit?: () => void;
  onDownload: () => void;
  onLike: () => void;
  initialLiked?: boolean;
  initialLikeCount?: number;
}

export const PanelControl = ({
  ImgSrc,
  alt,
  initialLiked,
  initialLikeCount,
  onEdit,
  onDownload,
  onLike,
}: Props) => {
  const [liked, setLiked] = useState(false);

  // Base styles for all buttons
  const buttonBaseStyles =
    "cursor-pointer p-1 rounded-md hover:bg-accent transition-colors";

  // Icon color based on theme and state
  const iconColor = "text-muted-foreground hover:text-foreground";
  const heartIconColor = initialLiked
    ? "text-destructive"
    : "text-muted-foreground hover:text-destructive";

  return (
    <div className="flex gap-2">
      {/* Download Button */}
      <button
        type="button"
        aria-label="Download"
        onClick={() => onDownload()}
        className={buttonBaseStyles}
      >
        <Download className={`${iconColor} size-5`} />
      </button>

      {/* Edit Button */}
      <button
        type="button"
        aria-label="Edit"
        onClick={onEdit}
        className={buttonBaseStyles}
      >
        <PenLine className={`${iconColor} size-5`} />
      </button>

      {/* Favorite Button */}
      <button
        type="button"
        aria-label="Favorite"
        title={initialLiked ? "Unlike" : "Like"}
        onClick={onLike}
        className={`${buttonBaseStyles} ${heartIconColor}`}
      >
        <Heart
          className={`size-5 transition-colors`}
          fill={initialLiked ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
};
