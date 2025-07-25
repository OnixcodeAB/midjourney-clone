import { DynamicAspectImage } from "@/components/surveys/DynamicAspectImage";
import { getImageData } from "../actions/image/getImageData";

const response = await getImageData();

let images: ImageExplorePage[] = [];
if (response.error) {
  console.error("Error fetching images:", response.error);
} else {
  images = response.imagesWithLikes || [];
  //console.log(images);
}

function splitIntoColumns<T>(data: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  data.forEach((item, index) => {
    result[index % columns].push(item);
  });
  return result;
}

export default async function SurveysPage() {
  //console.log("Fetched Plans:", Plans);
  const columns = splitIntoColumns(images, 5);
  return (
    <div className="flex justify-center gap-1 p-4">
      {columns.map((col, colIndex) => {
        return (
          <div key={colIndex} className="flex flex-col gap-1">
            {col.map((img, imgIndex) => {
              let cornerClass = "";

              if (colIndex === 0 && imgIndex === 0) {
                cornerClass = "rounded-tl-lg";
              }

              if (colIndex === columns.length - 1 && imgIndex === 0) {
                cornerClass = "rounded-tr-lg";
              }

              return (
                <DynamicAspectImage
                  key={img.id}
                  src={img.url}
                  alt={img.alt}
                  className={cornerClass}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
