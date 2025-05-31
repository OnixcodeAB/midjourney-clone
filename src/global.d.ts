export {};
interface ChatCompletionMessageToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}
declare global {
  type QualityType = "low" | "medium" | "high";

  type UsageResult = {
    allowed: boolean;
    error?: string;
    description?: string;
    current?: number;
    limit?: number | null;
  };

  type FolderType = {
    id: string;
    name: string;
    items: { id: string; url: string; type: "image" | "video" }[];
  };

  interface FolderItem {
    id: string;
    image_id: string;
    image_title: string;
    url: string;
    type: "image" | "video";
    folder_id: string;
    created_at: string;
  }
}
