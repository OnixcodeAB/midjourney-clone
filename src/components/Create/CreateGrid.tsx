"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ImageCard from "./ImageCard";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { deleteImageById } from "@/app/actions/image/deleteImageById";
import { toast } from "sonner";
import { LucideLoader2 } from "lucide-react";

interface Props {
  images: Image[];
  currentUserId: string;
}

interface SocketImageData {
  table: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  id: string;
  data: Image;
}

const CreateGrid = ({ images: initialImages, currentUserId }: Props) => {
  const [images, setImages] = useState<Image[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  // Initialize images state and display count with the initialImages prop
  useEffect(() => {
    setImages(initialImages);
    setDisplayCount(10); // Start with the first 20 images
  }, [initialImages]);

  // Handle scroll event to load more images
  const handleScroll = useCallback(() => {
    // Check if the user has scrolled to the bottom of the page (with a small buffer)
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
      displayCount < images.length
    ) {
      // Load the next batch of 20 images, but not more than the total number of images
      setDisplayCount((prev) => Math.min(prev + 20, images.length));
    }
  }, [displayCount, images.length]);

  // Attach and clean up the scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // --- Optimized message handler using socket data ---
  const handleDbUpdate = useCallback((socketData: SocketImageData) => {
    console.log("WebSocket update received:", socketData);

    const { operation, id, data } = socketData;

    if (operation === "INSERT") {
      // Add new image to the beginning of the list
      setImages((prev) => [data, ...prev]);
    } else if (operation === "UPDATE") {
      // Update existing image
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...data } : img))
      );
    } else if (operation === "DELETE") {
      // Remove deleted image
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  }, []);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    const { success } = await deleteImageById(imageId);
    if (success) {
      // Update locally for immediate feedback (socket will also update)
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Deleting Image", {
        description: "Your image has been deleted",
      });
    } else {
      toast.error("Deleting Image", {
        description:
          "An error occurred while deleting the image, please try again later.",
      });
    }
  }, []);

  // Memoized card renderer
  const renderImageCard = useCallback(
    (img: Image) => (
      <ImageCard
        key={img.id}
        id={img.id}
        url={img.url}
        search_text={img.search_text}
        status={img.status}
        progress_pct={img.progress_pct}
        prompt={
          img.status === "pending" || img.status === "running"
            ? "Generating..."
            : img.prompt
        }
        OnDelete={handleDeleteImage}
      />
    ),
    [handleDeleteImage]
  );

  // Handle real-time updates from Socket.IO
  const { isConnected } = useSocket(
    "http://localhost:5000",
    "db_update",
    handleDbUpdate
  );

  // Get only the images that should be displayed
  const displayedImages = images.slice(0, displayCount);

  // Group the currently displayed images by time
  const grouped = useMemo(() => {
    const now = new Date();

    const groups: {
      Today: Image[];
      Yesterday: Image[];
      "This Week": Image[];
      "This Month": Image[];
      Older: { [date: string]: Image[] };
    } = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: {},
    };

    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    };

    const isYesterday = (dateStr: string) => {
      const d = new Date(dateStr);
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      );
    };

    const isThisWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return (
        d >= start && d < end && !isToday(dateStr) && !isYesterday(dateStr)
      );
    };

    const isThisMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      const sameMonth = d.getMonth() === now.getMonth();
      const sameYear = d.getFullYear() === now.getFullYear();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return sameMonth && sameYear && d < start;
    };

    for (const img of displayedImages) {
      if (isToday(img.createdat)) groups["Today"].push(img);
      else if (isYesterday(img.createdat)) groups["Yesterday"].push(img);
      else if (isThisWeek(img.createdat)) groups["This Week"].push(img);
      else if (isThisMonth(img.createdat)) groups["This Month"].push(img);
      else {
        const d = new Date(img.createdat);
        const dateLabel = `${d.getDate().toString().padStart(2, "0")}-${(
          d.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${d.getFullYear()}`;
        if (!groups["Older"][dateLabel]) groups["Older"][dateLabel] = [];
        groups["Older"][dateLabel].push(img);
      }
    }
    return groups;
  }, [displayedImages]);

  // Empty state
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[79vh]">
        <img
          src="/empty-imagen.png"
          alt="Empty image"
          className="w-75 h-auto object-cover rounded-lg mb-2"
        />
        <p className="text-neutral-400">
          Create images using the prompt below or upload your own images.
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-2 w-full max-w-full space-y-6 h-full ">
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4">
          Disconnected from real-time updates. Attempting to reconnect...
        </div>
      )}

      {Object.entries(grouped).map(([section, imgs]) => {
        if (!imgs || (section === "Older" && Object.keys(imgs).length === 0)) {
          return null;
        }

        return section !== "Older" ? (
          <div key={section} className="w-full">
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-700 text-left">
              {section}
            </h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-y-4 gap-x-3">
              {(Array.isArray(imgs) ? imgs : []).map(renderImageCard)}
            </div>
          </div>
        ) : (
          <div key={section}>
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-700 text-left">
              Older
            </h2>
            {Object.entries(imgs).map(([date, dateImgs]) => (
              <div key={date} className="mb-8">
                <div className="font-medium text-gray-500 mb-2 pl-1">
                  {date}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-y-4 gap-x-3">
                  {dateImgs.map(renderImageCard)}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Show a loading indicator when more images are being fetched */}
      {images.length > displayCount && (
        <div className="flex justify-center py-4 text-gray-500 items-center">
          <LucideLoader2 className="animate-spin mr-2" />
          Loading more...
        </div>
      )}
    </div>
  );
};

export default CreateGrid;
