"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";
import ImageCard from "@/components/Home/ImageCard";
import { LayoutPanelTop, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { checkIfUserExists } from "@/app/actions/user/checkIfUserExists";
import { getImagesPaginated } from "@/app/actions/image/getImagesPaginated";

import { DynamicAspectImage } from "../Masonry/DynamicAspectImage";
import { MasonryImageGallery } from "../Masonry/MasonryImageGallery";

interface Props {
  initialImages: ImageExplorePage[];
}

export const ExploreHomePage = ({ initialImages }: Props) => {
  const { user } = useUser();
  const [userExists, setUserExists] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        loadMoreImages();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, hasMore]);

  // Handle loading more images when the user scrolls to the bottom
  const loadMoreImages = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const limit = 10;
    const offset = page * limit;
    const result = await getImagesPaginated(user?.id || null, limit, offset);

    if (result.data) {
      const newImages = result.data.filter(
        (newImg) => !images.some((img) => img.id === newImg.id)
      );

      setImages((prevImages) => [...prevImages, ...newImages]);
      setPage((prevPage) => prevPage + 1);

      if (result.data.length < limit) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };
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

  const columns = splitIntoColumns(displayed, 5);

  function splitIntoColumns<T>(data: T[], columns: number): T[][] {
    const result: T[][] = Array.from({ length: columns }, () => []);
    data.forEach((item, index) => {
      result[index % columns].push(item);
    });
    return result;
  }

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
    default: 4,
    768: 3,
    640: 2,
  };

  return (
    <div className="w-full m-auto bg-background flex flex-column items-center justify-center">
      <div className="w-full  ">
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
        <MasonryImageGallery
          images={displayed}
          columnsCount={5}
          handleOnSearch={handleSearch}
          handleOnClick={handleClick}
        />
        {/* <div className="flex justify-center gap-1 p-4">
          {columns.map((col, colIndex) => {
            return (
              <div key={colIndex} className="flex flex-col gap-1">
                {col.map((img, imgIndex) => {
                  let cornerClass = "";

                  if (colIndex === 0 && imgIndex === 0) {
                    cornerClass = "rounded-tl-lg";
                  }

                  if (colIndex === columns.length - 1 && imgIndex === 0) {
                    cornerClass = "rounded-tr-lg";
                  }

                  return (
                    <DynamicAspectImage
                      key={img.id}
                      src={img.url}
                      alt={img.alt}
                      className={cornerClass}
                      imageId={img.id.toString()}
                      author={img.author}
                      initialLikeCount={img.initialLikeCount}
                      initialIsLiked={img.initialIsLiked}
                      handleOnSearch={() =>
                        handleSearch(img.search_text ?? "", img.tags)
                      }
                    />
                  );
                })}
              </div>
            );
          })}
        </div> */}
        {!hasMore && (
          <div className="w-full text-center py-6 text-sm  border-t border-border mt-6 bg-background">
            <p className="text-muted-foreground/50 text-lg font-medium">
              No hay más imágenes para mostrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
