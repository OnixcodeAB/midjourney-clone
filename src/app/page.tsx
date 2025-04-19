import { ExploreHomePage } from "@/components/Home/ExploreHomePage";
import { getData } from "./actions/getData";

export default async function Home() {
  const images = await getData();

  return (
    <div className="w-full">
      <main className="p-6">
        <ExploreHomePage images={images} />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
