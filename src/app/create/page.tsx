import CreateGrid from "@/components/Create/CreateGrid";
import { getImagesForUser } from "../actions/image/getImagesForUser";



export default async function CreatePage() {
  // Fetch from DB or external API
  const response = await getImagesForUser();
  let images: Image[] = [];

  if (response.error) {
    console.error("Error fetching images:", response.error);
  } else {
    images = response.images || [];
  }

  return (
    <div className="flex-1">
      <CreateGrid images={images} />
    </div>
  );
}
