import { DynamicAspectImage } from "@/components/Masonry/DynamicAspectImage";
import { getImageData } from "../actions/image/getImageData";
import { addImageDimensions, splitIntoMasonryColumns } from "@/lib/constant";
import { MasonryImageGallery } from "@/components/Masonry/MasonryImageGallery";

const response = await getImageData();

let images: ImageExplorePage[] = [];
if (response.error) {
  console.error("Error fetching images:", response.error);
} else {
  images = response.imagesWithLikes || [];

  //console.log(images);
}

export default async function SurveysPage() {
  //console.log("Fetched Plans:", Plans);
  const columns = splitIntoMasonryColumns(images, 5);
  {
    /* <MasonryImageGallery images={images} columnsCount={5} />  */
  }
  return <div>Hello World</div>;
}
