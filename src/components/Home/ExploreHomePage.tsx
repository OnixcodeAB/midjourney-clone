"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ImageCard from "@/components/Home/ImageCard";

interface Image {
  id: number;
  src: string;
  alt: string;
  author: string;
  description: string;
}

interface Props {
  images: Image[];
}

export const ExploreHomePage = ({ images }: Props) => {
  const router = useRouter();

  const handleClick = (id: number) => {
    router.push(`/jobs/img_${id}`);
  };
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 space-y-2 -space-x-2">
      {images.map((img) => (
        <div
          key={img.id}
          onClick={() => handleClick(img.id)}
          className="cursor-pointer"
        >
          <ImageCard
            src={img.src}
            alt={img.alt}
            author={img.author}
            description={img.description}
          />
        </div>
      ))}
    </div>
  );
};
