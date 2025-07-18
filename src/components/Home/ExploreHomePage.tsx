"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";
import ImageCard from "@/components/Home/ImageCard";
import { LayoutPanelTop, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { checkIfUserExists } from "@/app/actions/user/checkIfUserExists";

interface Props {
  images: ImageExplorePage[];
}

export const ExploreHomePage = ({ images }: Props) => {
  const { user } = useUser();
  const [userExists, setUserExists] = useState(false);

  const [filter, setFilter] = useState<{
    searchText: string;
    tags: string[];
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const checkUser = async () => {
      if (user && user.id) {
        const exists = await checkIfUserExists(user.id);
        setUserExists(exists);
        // Optionally, you can handle the case where the user exists or not
      }
    };
    checkUser();
  }, [user]);

  // Memoize the displayed images based on the filter
  // If no filter is applied, show all images
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

  // Handle search and tag filtering
  const handleSearch = useCallback((searchText: string, tags: string[]) => {
    setFilter({ searchText, tags });
  }, []);

  // Handle image click to navigate to the image detail page
  const handleClick = (id: number) => {
    router.push(`/jobs/img_${id}`);
  };

  // Define breakpoint columns for Masonry layout
  // Adjust the number of columns based on screen width
  const breakpointCols = {
    default: 3,
    768: 2,
    640: 1,
  };

  return (
    <div className="bg-background">
      {filter && (
        <div className="sticky top-4 m-0 ml-1.5 left-0 z-50 flex items-center w-fit bg-card/50 text-card-foreground px-3 py-2 rounded-r-full shadow-md gap-2 mb-4 backdrop-blur-sm border border-border">
          <LayoutPanelTop className="w-5 h-5 opacity-90" />
          <span className="font-medium">{filter.searchText}</span>
          <button
            type="button"
            className="ml-1 p-1 rounded-full hover:bg-accent transition-colors"
            onClick={() => setFilter(null)}
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}
      <Masonry
        breakpointCols={breakpointCols}
        className="flex w-auto"
        columnClassName="my-masonry-grid_column "
      >
        {displayed.map((img) => (
          <div key={img.id} className="cursor-pointer p-[0.001rem]">
            <ImageCard
              imageId={img.id.toString()}
              src={img.url}
              alt={img.alt}
              author={img.author}
              prompt={img.description}
              initialLikeCount={img.initialLikeCount}
              initialIsLiked={img.initialIsLiked}
              isAuthenticated={userExists}
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
