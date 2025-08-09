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
    status?: "pending" | "completed" | "running";
    progress_pct?: number;
    createdat: string;
    tags: string[];
  }

  interface ImageExplorePage {
  id: number;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  author: string;
  description: string;
  search_text: string;
  tags: string[];
  initialLikeCount?: number;
  initialIsLiked?: boolean;
}
type Aspect = "1024x1024" | "1024x1536" | "1536x1024";
type Mode = "generate" | "reference" | "edit";

interface GenerateImageParams {
  prompt: string;
  aspect?: Aspect;
  quality?: QualityType; // used only for text->image
  mode?: Mode; // "generate" (default), "reference", "edit"
  imageRefs?: string[]; // scenario 2: reference image URLs (<=10 total with base)
  baseImageUrl?: string; // scenario 3: image to edit (mask applies to this)
  maskUrl?: string; // scenario 3: PNG with alpha channel (transparent = editable)
  // Back-compat alias:
  imagRefer?: string[]; // (will be merged into imageRefs if provided)
}
}
