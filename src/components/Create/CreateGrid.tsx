"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageCard from "./ImageCard";
import { useWebSocket } from "@/hooks/useWebSocket "; // Assuming this is the hook from earlier

interface Image {
  id: string;
  url: string;
  prompt: string;
  status?: "pending" | "running" | "complete";
  progress_pct?: number;
  createdAt: string;
}

interface Props {
  images: Image[];
  currentUserId?: string;
}

const CreateGrid = ({ images: initialImages }: Props) => {
  const [images, setImages] = useState<Image[]>(initialImages);

  // Handle image updates
  const { isConnected } = useWebSocket("ws://localhost:3001", (data: any) => {
    console.log("WebSocket received:", data);

    if (data.table === "Image" && data.operation === "UPDATE") {
      setImages((prevImages) => {
        const exists = prevImages.some((img) => img.id === data.id);

        if (exists) {
          // Update existing item
          return prevImages.map((img) =>
            img.id === data.id ? { ...img, ...data.data } : img
          );
        } else {
          // Add new item
          return [...prevImages, { ...data.data }];
        }
      });
    }
  });

  console.log("WebSocket connected:", isConnected);
  console.log("images", images);

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
      if (isToday(img.createdAt)) groups["Today"].push(img);
      else if (isThisWeek(img.createdAt)) groups["This Week"].push(img);
      else if (isThisMonth(img.createdAt)) groups["This Month"].push(img);
      else groups["Older"].push(img);
    }

    return groups;
  }, [images]);

  // Render
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
