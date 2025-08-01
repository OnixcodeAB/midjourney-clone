import CreateGrid from "@/components/Create/CreateGrid";
import { getImagesForUser } from "../actions/image/getImagesForUser";
import { auth } from "@clerk/nextjs/server";

interface ImageProps {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  status?: "pending" | "running" | "completed";
  progress_pct?: number;
  createdat: string;
  search_text?: string;
}

export default async function CreatePage() {
  const { userId } = await auth();
  // Fetch from DB or external API
  const response = await getImagesForUser({ noCache: false });
  let images: Image[] = [];

  if (response.error) {
    console.error("Error fetching images:", response.error);
  } else {
    images = response.images || [];
    //console.log(images);
  }

  return (
    <div className="flex-1">
      <CreateGrid images={images} currentUserId={userId ?? ""} />
    </div>
  );
}
