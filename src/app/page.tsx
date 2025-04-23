import { ExploreHomePage } from "@/components/Home/ExploreHomePage";
import { getData } from "./actions/getData";
import { getAllData } from "./actions/getAllData";

export default async function Home() {
  const images = await getAllData();

  return (
    <div className="w-full">
      <main className="p-6">
        <ExploreHomePage images={images} />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
