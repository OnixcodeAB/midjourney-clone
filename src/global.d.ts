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
}
