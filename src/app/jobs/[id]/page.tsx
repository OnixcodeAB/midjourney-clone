import { getImageById } from "@/app/actions/image/getImageBYId";
import JobsDetailPanel from "@/components/Jobs/JobsDetailPanel";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function JobDetailPage({ params }: Props) {
  //Extracts the id from URL params (like /jobs/create_123 or /jobs/img_456)
  const { id } = await params;

  //Gets the authenticated user's ID using Clerk
  const { userId } = await auth();

  //Splits the ID into two parts using underscore:
  //type: Either "create" or "img"
  //actualId: The actual ID of the resource
  const [type, actualId] = id.split("_");

  // Early return if invalid ID format
  if (type !== "create" && type !== "img") {
    notFound();
  }

  if (!actualId) notFound();

  // Fetch image data by ID
  const imageData = await getImageById(actualId, userId);

  // Handle different response scenarios
  if (imageData.error) {
    console.error("[GET_IMAGE_BY_ID_ERROR]", imageData.error);
    throw new Error("[GET_IMAGE_BY_ID_ERROR]:" + imageData.error);
  }

  if (imageData.message === "Not Found") {
    notFound();
  }

  //console.log(imageData.data);
  
 // Render the JobsDetailPanel with the fetched image data
  return <JobsDetailPanel image={imageData.data} />;
}
