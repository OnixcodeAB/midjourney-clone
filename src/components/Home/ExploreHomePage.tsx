"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";
import ImageCard from "@/components/Home/ImageCard";
import { LayoutPanelTop, X } from "lucide-react";

interface ImageExplorePage {
  id: number;
  url: string;
  alt: string;
  author: string;
  description: string;
  search_text: string;
  tags: string[];
}

interface Props {
  images: ImageExplorePage[];
}

export const ExploreHomePage = ({ images }: Props) => {
  // Local filter state
  const [filter, setFilter] = useState<{
    searchText: string;
    tags: string[];
  } | null>(null);

  const router = useRouter();

  // Memoize displayed images
  const displayed = useMemo(() => {
    if (!filter) return images;
    const searchLower = filter.searchText?.toLowerCase() || "";
    return images.filter((img) => {
      const imgSearch = img.search_text?.toLowerCase() || "";
      const matchesText = imgSearch.includes(searchLower);
      const matchesTag = img.tags.some((t) => filter.tags.includes(t));
      return matchesText || matchesTag;
    });
  }, [images, filter]);

  // Handlers
  const handleSearch = useCallback((searchText: string, tags: string[]) => {
    setFilter({ searchText, tags });
  }, []);

  const handleClick = (id: number) => {
    router.push(`/jobs/img_${id}`);
  };

  // Define responsive breakpoints for masonry
  const breakpointCols = {
    default: 3,
    768: 2,
    640: 1,
  };

  return (
    <div className="">
      {filter && (
        <div className="sticky top-4 m-0 ml-1.5 left-0 z-50 flex items-center w-fit bg-white/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 rounded-r-full shadow-md gap-2  mb-4">
          <LayoutPanelTop className="w-5 h-5  opacity-90" />
          <span className="font-medium">{filter.searchText}</span>
          <button
            type="button"
            className="ml-1 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            onClick={() => setFilter(null)}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <Masonry
        breakpointCols={breakpointCols}
        className="flex w-auto"
        columnClassName="my-masonry-grid_column"
      >
        {displayed.map((img) => (
          <div
            key={img.id}
            /* onClick={() => handleClick(img.id)} */
            className="cursor-pointer"
          >
            <ImageCard
              src={img.url}
              alt={img.alt}
              author={img.author}
              prompt={img.description}
              handleOnClick={() => handleClick(img.id)}
              handleOnSearch={() =>
                handleSearch(img.search_text ?? "", img.tags)
              }
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
};
