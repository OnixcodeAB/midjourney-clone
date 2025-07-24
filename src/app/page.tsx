import { ExploreHomePage } from "@/components/Home/ExploreHomePage";
import { getAllData } from "./actions/data/getAllData";
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
      <footer className="row-start-3 flex gap-[24px] my-8 flex-wrap items-center justify-center">
        Hola
      </footer>
    </div>
  );
}
