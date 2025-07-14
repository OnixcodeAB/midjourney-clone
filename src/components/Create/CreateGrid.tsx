"use client";

import { useCallback, useMemo, useState } from "react";
import ImageCard from "./ImageCard";
import { useSocket } from "@/hooks/useSocket"; // Updated to useSocket

interface Props {
  images: Image[];
  currentUserId?: string;
}

const CreateGrid = ({ images: initialImages }: Props) => {
  const [images, setImages] = useState<Image[]>(initialImages);

  // --- Define the message handler using useCallback ---
  const handleDbUpdate = useCallback((data: any) => {
    console.log("Socket.IO received:", data);

    // Ensure the data structure matches expectations
    if (data) {
      setImages((prevImages) => {
        const exists = prevImages.some((img) => img.id === data.id);

        if (exists) {
          // Update existing item: Merge existing data with new data
          return prevImages.map((img) =>
            img.id === data.id ? { ...img, ...data.data } : img
          );
        } else {
          // Add new item: Treat the payload as a new image
          // Ensure all required fields for the 'Image' interface are present
          // Provide defaults if necessary, or ensure the backend sends complete objects
          const newImage: Image = {
            id: data.id,
            url: data.data.url || "",
            prompt: data.data.prompt || "",
            provider: data.data.provider || "openai",
            status: data.data.status || "pending",
            progress_pct: data.data.progress_pct || 0.3,
            createdAt: data.data.createdAt || new Date().toISOString(),
            ...data.data, // Spread the rest of the data, potentially overwriting defaults
          };

          // Filter out potentially invalid new images if essential data is missing
          if (!newImage.id || !newImage.createdat) {
            console.warn(
              "Received incomplete image data for new item, skipping:",
              data
            );
            return prevImages;
          }
          return [...prevImages, newImage];
        }
      });
    } else {
      console.warn("Received invalid db_update payload:", data);
    }
    // The dependency array is empty `[]` because `setImages` is guaranteed
    // by React to be stable and we are using the functional update form
    // which doesn't need `images` in the closure.
  }, []); // <--- Empty dependency array for useCallback

  // Handle real-time updates from Socket.IO
  const { isConnected } = useSocket(
    "http://localhost:5000",
    "db_update",
    handleDbUpdate // Pass the memoized callback function
  );

  //console.log("Socket.IO connected:", isConnected);

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
    <div className="px-2 sm:px-2 w-full max-w-full space-y-6 h-[79vh]">
      {Object.entries(grouped).map(([section, imgs]) =>
        imgs && Object.keys(imgs).length > 0 ? (
          section !== "Older" ? (
            <div key={section} className="w-full">
              <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-700 text-left">
                {section}
              </h2>
              <div
                className=" w-full
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-6 
            2xl:grid-cols-8 
            gap-y-4 
            gap-x-3
            "
              >
                {(imgs as Image[]).map((img) => (
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
                ))}
              </div>
            </div>
          ) : (
            // "Older" section: Group by date
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
                      className="
                  grid 
                  grid-cols-1 
                  sm:grid-cols-2 
                  md:grid-cols-3 
                  lg:grid-cols-4 
                  xl:grid-cols-6 
                  2xl:grid-cols-8 
                  gap-y-4 
                  gap-x-3
                  "
                    >
                      {dateImgs.map((img) => (
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
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )
        ) : null
      )}
    </div>
  );
};

export default CreateGrid;
