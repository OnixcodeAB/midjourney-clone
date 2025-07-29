"use client";

import { useEffect, useState } from "react";
import { DynamicAspectImage } from "@/components/Masonry/DynamicAspectImage";

interface Props {
  images: ImageExplorePage[];
  columnsCount: number;
  handleOnSearch: (searchText: string, tags: string[]) => void;
  handleOnClick?: (id: number) => void;
  isAuthenticated: boolean;
}

export function MasonryImageGallery({
  images,
  columnsCount,
  handleOnSearch = () => {},
  handleOnClick = () => {},
  isAuthenticated = false,
}: Props) {
  const [columns, setColumns] = useState<ImageExplorePage[][]>(
    Array.from({ length: columnsCount }, () => [])
  );
  console.log("columnsCount", columnsCount);

  useEffect(() => {
    // Only proceed if we have images and columns
    if (!images.length || columnsCount < 1) {
      setColumns([]);
      return;
    }

    let isMounted = true; // Track if component is still mounted

    const loadImages = async () => {
      const colHeights = new Array(columnsCount).fill(0);
      const newCols: ImageExplorePage[][] = Array.from(
        { length: columnsCount },
        () => []
      );

      try {
        await Promise.all(
          images.map((img) => {
            return new Promise<void>((resolve, reject) => {
              const image = new Image();
              image.src = img.url;

              image.onload = () => {
                if (!isMounted) return resolve(); // Skip if unmounted

                const aspectRatio = image.naturalHeight / image.naturalWidth;
                // Find the shortest column more efficiently
                const shortestIndex = colHeights.reduce(
                  (minIndex, height, index) =>
                    height < colHeights[minIndex] ? index : minIndex,
                  0
                );

                colHeights[shortestIndex] += aspectRatio;
                newCols[shortestIndex].push(img);
                resolve();
              };

              image.onerror = () => {
                console.warn(`Failed to load image: ${img.url}`);
                resolve(); // Continue even if some images fail
              };
            });
          })
        );

        if (isMounted) {
          setColumns(newCols);
        }
      } catch (error) {
        console.error("Error loading images:", error);
        if (isMounted) {
          setColumns(Array.from({ length: columnsCount }, () => []));
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [images, columnsCount]);

  return (
    <div
      className={`
  sm:w-40 md:w-fit xl:w-fit
  grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
  items-start gap-1 px-4 md:px-0
  transition-all duration-300 ease-in-out
`}
    >
      {columns.map((col, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col items-center gap-2 md:gap-1"
        >
          {col.map((img, imgIndex) => {
            const cornerClass =
              colIndex === 0 && imgIndex === 0
                ? "rounded-tl-lg"
                : colIndex === columns.length - 1 && imgIndex === 0
                ? "rounded-tr-lg"
                : "";

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
                isAuthenticated={isAuthenticated}
                OnClick={() => handleOnClick(img.id)}
                OnSearch={() => {
                  handleOnSearch(img.search_text ?? "", img.tags);
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
