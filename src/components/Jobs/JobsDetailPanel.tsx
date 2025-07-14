"use client";
import Link from "next/link";
import { usePrompt } from "@/app/context/PromptContext";
import ImageCard from "../Home/ImageCard";
import { PanelControl } from "./PanelControl";
import EditModal from "../Edit/Editmodal";
import { useState } from "react";
import { toast } from "sonner";

interface Image {
  id: number;
  url: string;
  alt: string;
  author: string;
  prompt: string;
}

interface Props {
  image: Image;
}

export default function JobsDetailPanel({ image }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const { setPrompt } = usePrompt();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(image.prompt)
      .then(() => {
        toast.success("Texto copiado al portapapeles!");
      })
      .catch(() => {
        toast.error("Error al copiar el texto.");
      });
  };

  return (
    <div className="absolute top-0 inset-0 flex h-full bg-background overflow-hidden">
      {/* Image side */}
      <div className="relative mt-18 flex-1 flex flex-col items-center justify-center bg-background py-8">
        <div className="min-w-lg">
          <ImageCard
            src={image.url}
            alt={image.alt}
            author={image.author}
            imgClassName="h-[80vh]"
          >
            {/* Hoverable Top Action Menu */}
            <div className="absolute top-4 right-4 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <PanelControl
                ImgSrc={image.url}
                alt={image.alt}
                onEdit={() => setIsEditing(true)} // trigger modal
              />
            </div>
          </ImageCard>
        </div>

        {/* Close button */}
        <Link
          href="/"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl"
        >
          ✕
        </Link>
      </div>

      {/* Info panel (right) */}
      <div className="w-[300px] sm:w-[400px] p-6 border-l mt-15 border-border relative">
        <div className="flex gap-5 mb-4">
          <p className="text-md text-muted-foreground">21 may...</p>
          <PanelControl
            ImgSrc={image.url}
            alt={image.alt}
            theme="light"
            onEdit={() => setIsEditing(true)} // trigger modal
          />
        </div>
        <div className="mb-1 text-sm text-muted-foreground">{image.author}</div>

        {/* Image details */}
        <div
          onClick={() => {
            setPrompt(image.prompt ?? "");
            handleCopy();
          }}
          className="group relative p-4 transition-colors duration-300 rounded-lg hover:bg-accent cursor-pointer"
        >
          <p className="text-md  flex-wrap mb-4 font-extralight leading-snug">
            {image.prompt ?? "No description."}
          </p>

          <p className="absolute bottom-2 right-2  text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            + Use the text
          </p>
        </div>
        {/* End image details */}
      </div>
      {/* Modal */}
      <EditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        imgSrc={image.url}
        alt={image.alt}
      />
    </div>
  );
}
