"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";
import ImageCard from "@/components/Home/ImageCard";

interface ImageExplorePage {
  id: number;
  url: string;
  alt: string;
  author: string;
  description: string;
}

interface Props {
  images: ImageExplorePage[];
}

export const ExploreHomePage = ({ images }: Props) => {
  const router = useRouter();

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
    <Masonry
      breakpointCols={breakpointCols}
      className="flex w-auto"
      columnClassName="my-masonry-grid_column"
    >
      {images.map((img) => (
        <div
          key={img.id}
          /* onClick={() => handleClick(img.id)} */
          className="cursor-pointer"
        >
          <ImageCard
            src={img.url}
            alt={img.alt}
            author={img.author}
            description={img.description}
            handleOnClick={() => handleClick(img.id)}
          />
        </div>
      ))}
    </Masonry>
  );
};
