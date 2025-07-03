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

  export interface FeatureDetail {
    description: string;
    quantity?: number | string;
    period?: string;
    duration?: string;
    enabled?: boolean;
  }

  export interface Feature {
    name: string;
    description: string;
    enabled?: boolean;
    quantity?: number | string;
    type?: string;
    duration?: string;
    details?: {
      [key: string]: FeatureDetail;
    };
  }

  export interface DbFeaturesContainer {
    description: string;
    features: Feature[];
    title: string;
  }

  interface Plan {
    id: string;
    plan_id: string;
    name: string;
    frequency: string;
    price: number;
    features: DbFeaturesContainer;
    description: string;
  }

  interface SubscriptionPlan {
    id: string;
    features: DbFeaturesContainer;
    frequency: "monthly" | "yearly" | "one-time";
    high_quality_limit: number;
    low_quality_limit: number;
    medium_quality_limit: number;
    name: string;
    plan_id: string;
    price: number;
  }

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
    prompt: string;
    type: "image" | "video";
    folder_id: string;
    created_at: string;
  }
  interface Image {
    id: string;
    user_id: string;
    user_name: string;
    url: string;
    search_text: string;
    prompt: string;
    provider: string;
    task_id: string;
    status?: "pending" | "complete" | "running";
    progress_pct?: number;
    createdat: string;
    tags: string[];
  }
}
