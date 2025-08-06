import { ExploreHomePage } from "@/components/Home/ExploreHomePage";
import { getImageData } from "./actions/image/getImageData";

export default async function Home() {
  //const images = await getAllData();
  const response = await getImageData();

  let images: ImageExplorePage[] = [];
  if (response.error) {
    console.error("Error fetching images:", response.error);
  } else {
    images = response.imagesWithLikes || [];
    //console.log(images);
  }

  return (
    <div className="justify-center ">
      <main className="py-6 w-full flex items-center justify-center ">
        <ExploreHomePage initialImages={images} />
      </main>
    </div>
  );
}
