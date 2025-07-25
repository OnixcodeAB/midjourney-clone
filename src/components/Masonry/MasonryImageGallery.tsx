"use client";

import { useEffect, useState } from "react";
import { DynamicAspectImage } from "@/components/Masonry/DynamicAspectImage";

interface Props {
  images: ImageExplorePage[];
  columnsCount?: number;
  handleOnSearch: (searchText: string, tags: string[]) => void;
  handleOnClick?: (id: number) => void;
}

export function MasonryImageGallery({
  images,
  columnsCount = 5,
  handleOnSearch = () => {},
  handleOnClick = () => {},
}: Props) {
  const [columns, setColumns] = useState<ImageExplorePage[][]>(
    Array.from({ length: columnsCount }, () => [])
  );

  

  useEffect(() => {
    const loadImages = async () => {
      const colHeights = new Array(columnsCount).fill(0);
      const newCols: ImageExplorePage[][] = Array.from(
        { length: columnsCount },
        () => []
      );

      const promises = images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.src = img.url;
            image.onload = () => {
              const aspectRatio = image.naturalHeight / image.naturalWidth;
              const shortestIndex = colHeights.indexOf(Math.min(...colHeights));
              colHeights[shortestIndex] += aspectRatio;
              newCols[shortestIndex].push(img);
              resolve();
            };
          })
      );

      await Promise.all(promises);
      setColumns(newCols);
    };

    loadImages();
  }, [images, columnsCount]);

  return (
    <div className="flex justify-center gap-1 p-4">
      {columns.map((col, colIndex) => (
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
