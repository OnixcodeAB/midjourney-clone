import { ExploreHomePage } from "@/components/Home/ExploreHomePage";
import { getAllData } from "./actions/data/getAllData";
import { getImageData } from "./actions/image/getImageData";

interface ImageExplorePage {
  id: number;
  url: string;
  alt: string;
  author: string;
  description: string;
  search_text: string;
  tags: string[];
}

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
      <main className="p-6 w-full flex items-center justify-center ">
        <ExploreHomePage images={images} />
      </main>
      <footer className="row-start-3 flex gap-[24px] my-8 flex-wrap items-center justify-center">
        Hola
      </footer>
    </div>
  );
}
