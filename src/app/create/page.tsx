import CreateGrid from "@/components/Create/CreateGrid";
import { getData } from "../actions/api/create/getData";

interface Image {
  id: string;
  user_id: string;
  user_name: string;
  url: string;
  prompt: string;
  provider: string;
  task_id: string;
  status?: "pending" | "complete" | "running";
  progress_pct?: number;
  createdat: string;
}

export default async function CreatePage() {
  // Fetch from DB or external API
  const images: Image[] = await getData();

  return (
    <div className="flex-1">
      <CreateGrid images={images} />
    </div>
  );
}
