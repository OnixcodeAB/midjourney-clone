import { ExploreHomePage } from "@/components/Home/ExploreHomePage";
import { getAllData } from "./actions/getAllData";

export default async function Home() {
  const images = await getAllData();

  return (
    <div className="justify-center">
      <main className="p-6 w-full flex items-center justify-center ">
        <ExploreHomePage images={images} />
      </main>
      <footer className="row-start-3 flex gap-[24px] my-8 flex-wrap items-center justify-center">Hola</footer>
    </div>
  );
}
