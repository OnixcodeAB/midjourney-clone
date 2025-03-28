"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageCard from "@/components/Home/ImageCard";

interface Image {
  id: number;
  src: string;
  alt: string;
  author: string;
  description: string;
}

export default function Home() {
  const [images, setImages] = useState<Image[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then(setImages);
  }, []);

  const handleClick = (id: number) => {
    router.push(`/jobs/${id}`);
  };

  return (
    <div className="w-full">
      <main className="p-6">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
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
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
