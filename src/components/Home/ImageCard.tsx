import { useState } from "react";
import { Heart, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  src: string;
  alt: string;
  author?: string;
  description?: string;
  children?: React.ReactNode; // 👈 added
  imgClassName?: string;
  showAuthor?: boolean;
  showLike?: boolean;
  showSearch?: boolean;
  handleOnClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
  handleOnSearch?: () => void;
}

export default function ImageCard({
  src,
  alt,
  author,
  description,
  imgClassName = "h-auto",
  children,
  handleOnClick,
  handleOnSearch,
  showAuthor = true,
  showLike = true,
  showSearch = true,
}: Props) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative w-fit overflow-hidden break-inside-avoid shadow-md group">
      <img
        src={src}
        alt={alt}
        onClick={handleOnClick}
        className={`max-w-full transition-transform duration-300 group-hover:scale-105 ${imgClassName}`}
      />

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between text-white font-semibold text-lg px-4 py-2">
        {showAuthor && (
          <span className="block truncate">{author ? `by ${author}` : ""}</span>
        )}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* Search Button */}
            {showSearch && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="btn-search"
                    className="
                      relative p-2 rounded-full cursor-pointer 
                      hover:bg-white/10 hover:backdrop-blur-sm
                      transition
                      flex items-center justify-center
                    "
                    onClick={handleOnSearch}
                  >
                    <Search size={18} strokeWidth={3} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="font-bold bg-gray-700"
                >
                  Search for similar images
                </TooltipContent>
              </Tooltip>
            )}
            {/* Like Button */}
            {showLike && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`
                      relative py-1 px-4 rounded-full cursor-pointer 
                      hover:bg-white/10 hover:backdrop-blur-sm
                      transition
                      flex items-center justify-center
                      ${liked ? "text-red-400" : ""}
                    `}
                    onClick={() => setLiked((l) => !l)}
                    title="Like"
                  >
                    <Heart
                      size={18}
                      strokeWidth={3}
                      fill={liked ? "#f87171" : "none"}
                    />
                    <span className="ml-1 min-w-[1.5em] text-center">
                      {+(liked ? 1 : 100)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="bg-gray-700"
                >
                  <span className="font-bold">Like</span>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>

      {/* Extra overlays passed by parent */}
      {children}
    </div>
  );
}
