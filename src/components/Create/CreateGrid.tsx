"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ImageCard from "./ImageCard";
import { useSocket } from "@/hooks/useSocket"; // Updated to useSocket
import { useRouter } from "next/navigation";

interface Props {
  images: Image[];
  currentUserId?: string;
}

const CreateGrid = ({ images: initialImages }: Props) => {
  const [images, setImages] = useState<Image[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Esto fuerza a Next.js a re-renderizar el SSR la ruta actual
    router.refresh();
  }, [router]);

  useEffect(() => {
    // Initialize images state with the initialImages prop
    setImages(initialImages);
  }, [initialImages]);

  // --- Define the message handler using useCallback ---
  const handleDbUpdate = useCallback(async () => {
    try {
      // Fuerza bypass de caché
      const resp = await fetch("/api/create?noCache=true");
      if (!resp.ok) throw new Error("Fetch error " + resp.status);
      const { images: freshImages } = await resp.json();
      setImages(freshImages);
    } catch (err) {
      console.error("Error refetching images:", err);
    }
  }, []);

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
      />
    ),
    []
  );

  // Handle real-time updates from Socket.IO
  const { isConnected } = useSocket(
    "http://localhost:5000",
    "db_update",
    handleDbUpdate // Pass the memoized callback function
  );

  const now = new Date();

  // Group images by time
  const grouped = useMemo(() => {
    const groups: {
      Today: Image[];
      "This Week": Image[];
      "This Month": Image[];
      Older: { [date: string]: Image[] };
    } = {
      Today: [],
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

    const isThisWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return d >= start && d < end && !isToday(dateStr);
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
    </div>
  );
};

export default CreateGrid;
