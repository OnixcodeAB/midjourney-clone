"use client";
import Link from "next/link";
import { usePrompt } from "@/app/context/PromptContext";
import { PanelControl } from "./PanelControl";
import EditModal from "../Edit/Editmodal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import JobImagePreview from "./JobImagePreview";
import { X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { checkIfUserExists } from "@/app/actions/user/checkIfUserExists";
import { BannerModal } from "../layout/Modals/BannerModal";

interface Image {
  id: number;
  url: string;
  alt: string;
  author: string;
  prompt: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  isAuthenticated?: boolean;
}

interface Props {
  image: Image;
}

export default function JobsDetailPanel({ image }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();
  const [userExists, setUserExists] = useState(false);
  const { setPrompt } = usePrompt();
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(image.initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCopy = () => {
    if (!userExists) {
      return setIsBannerOpen(true);
    }
    navigator.clipboard
      .writeText(image.prompt)
      .then(() => {
        toast.success("Texto copiado al portapapeles!");
      })
      .catch(() => {
        toast.error("Error al copiar el texto.");
      });
  };

  const handleDownload = () => {
    if (!userExists) {
      return setIsBannerOpen(true);
    }
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `${image.alt || "image"}.jpg`;
    link.click();
  };

  const handleEdit = () => {
    if (!userExists) {
      return setIsBannerOpen(true);
    } else {
      return setIsEditing(true);
    }
  };

  const handleLike = async () => {
    if (!userExists) {
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
          imageId: image.id,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const data = await response.json();
      setIsLiked(data.isLike);
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert UI state if API call fails
      setIsLiked((prev) => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-0 inset-0 flex h-full bg-background overflow-hidden">
      {/* Image side */}
      <div className="relative mt-18 flex-1 flex flex-col items-center justify-center bg-background py-8">
        <div className="min-w-lg ">
          <JobImagePreview
            src={image.url}
            alt={image.alt}
            author={image.author}
            imgClassName="h-[80vh]"
          />
        </div>

        {/* Close button */}
        <button
          type="button"
          aria-label="Close panel"
          className="absolute top-4 right-4 cursor-pointer py-1 px-3 rounded-md hover:bg-accent  transition-colors"
        >
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-6" />
          </Link>
        </button>
      </div>

      {/* Info panel (right) */}
      <div className="w-[300px] sm:w-[400px] p-6 border-l mt-15 border-border relative">
        <div className="flex gap-5 mb-4">
          <p className="text-md text-muted-foreground">21 may...</p>
          <PanelControl
            ImgSrc={image.url}
            alt={image.alt}
            theme="light"
            onEdit={handleEdit} // trigger modal
            onDownload={handleDownload} // handle download
            onLike={handleLike} // handle like
            initialLiked={isLiked} // initial like state
            initialLikeCount={image.initialLikeCount}
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
      <BannerModal
        isOpen={isBannerOpen}
        onClose={() => setIsBannerOpen(false)}
      />
    </div>
  );
}
