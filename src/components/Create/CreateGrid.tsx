"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ImageCard from "./ImageCard";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { getPaginatedImagesForUser } from "@/app/actions/image/getPaginatedImagesForUser";
import { deleteImageById } from "@/app/actions/image/deleteImageById";
import { toast } from "sonner";

interface Props {
  images: Image[];
  currentUserId: string;
}

interface SocketImageData {
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  id: string;
  data: Image;
}

const CreateGrid = ({ images: initialImages, currentUserId }: Props) => {
  const [images, setImages] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  // Initialize images state with the initialImages prop
  useEffect(() => {
    setImages(initialImages);
    setHasMore(initialImages.length >= 10);
  }, [initialImages]);

  const loadMoreImages = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const limit = 10;
    const offset = page * limit;

    try {
      const result = await getPaginatedImagesForUser(limit, offset);

      if (result.images) {
        const newImages = result.images.filter(
          (newImg) => !images.some((img) => img.id === newImg.id)
        );

        console.log("loading more image", newImages);

        setImages((prevImages) => [...prevImages, ...newImages]);
        setPage((prevPage) => prevPage + 1);
        setHasMore(result.hasMore ?? false);
      }
    } catch (error) {
      console.error("Error loading more images:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, hasMore, loading, page, images]);

  // Scroll handler
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
  }, [loading, hasMore, loadMoreImages]);

  // --- Optimized message handler using socket data ---
  const handleDbUpdate = useCallback((socketData: SocketImageData) => {
    console.log("WebSocket update received:", socketData);
    
    const { operation, id, data } = socketData;
    
    if (operation === 'INSERT') {
      // Add new image to the beginning of the list
      setImages(prev => [data, ...prev]);
    } 
    else if (operation === 'UPDATE') {
      // Update existing image
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, ...data } : img
      ));
    }
    else if (operation === 'DELETE') {
      // Remove deleted image
      setImages(prev => prev.filter(img => img.id !== id));
    }
  }, []);

  const handleDeleteImage = async (imageId: string) => {
    const { success } = await deleteImageById(imageId);
    if (success) {
      // The WebSocket will handle the state update, but we can update locally for immediate feedback
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast.success("Deleting Image", {
        description: "Your image has been deleted",
      });
    } else {
      toast.error("Deleting Image", {
        description:
          "An error occurred while deleting the image, please try again later.",
      });
    }
  };

  // Render memoizado de tarjetas
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
    []
  );

  // Handle real-time updates from Socket.IO
  const { isConnected } = useSocket(
    "http://localhost:5000",
    "db_update",
    handleDbUpdate
  );

  const now = new Date();

  // Group images by time
  const grouped = useMemo(() => {
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

    for (const img of images) {
      if (isToday(img.createdat)) groups["Today"].push(img);
      else if (isYesterday(img.createdat)) groups["Yesterday"].push(img);
      else if (isThisWeek(img.createdat)) groups["This Week"].push(img);
      else if (isThisMonth(img.createdat)) groups["This Month"].push(img);
      else {
        // Group by date string, e.g. 3-06-2025
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
  }, [images]);

  // If no images are available, show a placeholder
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
            <div
              className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
              lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-y-4 gap-x-3"
            >
              {(imgs as Image[]).map(renderImageCard)}
            </div>
          </div>
        ) : (
          <div key={section}>
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-700 text-left">
              Older
            </h2>
            {Object.entries(imgs as { [date: string]: Image[] }).map(
              ([date, dateImgs]) => (
                <div key={date} className="mb-8">
                  <div className="font-medium text-gray-500 mb-2 pl-1">
                    {date}
                  </div>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
                    lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-y-4 gap-x-3"
                  >
                    {dateImgs.map(renderImageCard)}
                  </div>
                </div>
              )
            )}
          </div>
        );
      })}

      {/* End of content message */}
      {!hasMore && (
        <div className="text-center py-4 text-gray-500">
          You've reached the end of your images
        </div>
      )}
    </div>
  );
};

export default CreateGrid;