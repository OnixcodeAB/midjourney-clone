import CreateGrid from "@/components/Create/CreateGrid";
import { getData } from "../actions/api/create/getData";

interface Image {
  id: string;
  url: string;
  prompt: string;
  status?: "pending" | "complete" | "running";
  createdat: string;
}

export default async function CreatePage() {
  // Fetch from DB or external API
  const images: Image[] = await getData();

  console.log(images)

  return (
    <div className="flex-1">
      <CreateGrid images={images} />
    </div>
  );
}
