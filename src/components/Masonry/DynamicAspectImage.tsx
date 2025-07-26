"use client";

import { useEffect, useState } from "react";
import { Heart, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  imageId: string;
  src: string;
  alt: string;
  className?: string;
  author?: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  showLike?: boolean;
  showSearch?: boolean;
  showAuthor?: boolean;
  isAuthenticated?: boolean;
  handleLike?: () => void;
  OnClick?: () => void;
  OnSearch?: () => void;
}

export function DynamicAspectImage({
  imageId,
  src,
  alt,
  className = "",
  author,
  initialLikeCount = 0,
  initialIsLiked = false,
  showLike = true,
  showSearch = true,
  showAuthor = true,
  isAuthenticated = false,
  OnSearch = () => {},
  OnClick = () => {},
}: Props) {
  const [aspectClass, setAspectClass] = useState("aspect-square");
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratioW = img.naturalWidth;
      const ratioH = img.naturalHeight;

      const gcd = (a: number, b: number): number =>
        b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(ratioW, ratioH);
      const w = Math.round(ratioW / divisor);
      const h = Math.round(ratioH / divisor);

      setAspectClass(`aspect-[${w}/${h}]`);
    };
  }, [src]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      return setIsBannerOpen(true);
    }

    if (isLoading) return;
    setIsLoading(true);
    try {
      const action = isLiked ? "unlike" : "like";
      const response = await fetch("/api/images/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const data = await response.json();
      setIsLiked(data.isLike);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert UI state if API call fails
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative sm:w-sm md:w-fit lg:w-3xs  ${aspectClass} cursor-pointer bg-gray-200 overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onClick={OnClick}
      />

      {/* Bottom overlay */}
      <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-4 py-3">
        {showAuthor && (
          <span className="block truncate text-sm font-medium text-white">
            {author || ""}
          </span>
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
                    className="p-2 rounded-full cursor-pointer hover:bg-white/20 hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center text-white"
                    onClick={OnSearch}
                  >
                    <Search size={18} strokeWidth={3} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="bg-foreground text-background"
                >
                  <p className="font-medium">Search for similar images</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Like Button */}
            {showLike && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`p-2 rounded-full cursor-pointer hover:bg-white/20 hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center ${
                      isLiked ? "text-red-500" : "text-white"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleLike}
                    aria-label={isLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      size={18}
                      strokeWidth={3}
                      fill={isLiked ? "currentColor" : "none"}
                      className={isLoading ? "animate-pulse" : ""}
                    />
                    <span className="ml-1 min-w-[1.5em] text-center text-sm">
                      {likeCount}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="bg-foreground text-background"
                >
                  <p className="font-medium">{isLiked ? "Unlike" : "Like"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
