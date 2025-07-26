import { DynamicAspectImage } from "@/components/Masonry/DynamicAspectImage";
import { getImageData } from "../actions/image/getImageData";
import { addImageDimensions, splitIntoMasonryColumns } from "@/lib/constant";
import { MasonryImageGallery } from "@/components/Masonry/MasonryImageGallery";
import { ResponsiveGrid } from "@/components/surveys/ResponsiveGrid ";

const response = await getImageData();

let images: ImageExplorePage[] = [];
if (response.error) {
  console.error("Error fetching images:", response.error);
} else {
  images = response.imagesWithLikes || [];

  //console.log(images);
}

const breakpointCols = {
  default: 4,
  small: 2,
  medium: 2,
  large: 3,
  xxlarge: 4,
};

export default async function SurveysPage() {
  //console.log("Fetched Plans:", Plans);
  const columns = splitIntoMasonryColumns(images, 5);
  {
    /* <MasonryImageGallery images={images} columnsCount={5} />  */
  }
  {
    /* <ResponsiveGrid breakpointCols={breakpointCols} gap="16px" /> */
  }
  return <ResponsiveGrid breakpointCols={breakpointCols} gap="16px" />;
}
