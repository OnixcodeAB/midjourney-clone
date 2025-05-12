"use client";

import { useCallback, useMemo, useState } from "react";
import ImageCard from "./ImageCard";
import { useSocket } from "@/hooks/useSocket"; // Updated to useSocket


interface Image {
  id: string;
  url: string;
  prompt: string;
  status?: "pending" | "running" | "complete";
  progress_pct?: number;
  createdat: string;
}

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
            id: data.id, // Must be provided by the backend notification
            url: data.data.url || "", // Provide default or ensure it's sent
            prompt: data.data.prompt || "", // Provide default or ensure it's sent
            status: data.data.status || "pending", // Default status
            progress_pct: data.data.progress_pct || 0, // Default progress
            createdAt: data.data.createdAt || new Date().toISOString(), // Need a creation date! Ensure backend sends it.
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
    const groups: { [key: string]: Image[] } = {
      Today: [],
      "This Week": [],
      "This Month": [],
      Older: [],
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
      else groups["Older"].push(img);
    }

    return groups;
  }, [images]);

  return (
    <div className="p-6 w-full max-w-fit space-y-6">
      {Object.entries(grouped).map(
        ([section, imgs]) =>
          imgs.length > 0 && (
            <div key={section}>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                {section}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-y-2 gap-x-8">
                {imgs.map((img) => (
                  <ImageCard
                    key={img.id}
                    id={img.id}
                    url={img.url}
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
  );
};

export default CreateGrid;
