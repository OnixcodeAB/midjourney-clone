import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

interface Image {
  id: number;
  src: string;
  alt: string;
  author: string;
  description: string;
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await fetch(`http://localhost:3000/api/images/${id}`, {
    cache: "default",
  });

  if (!res.ok) notFound();

  const image: Image = await res.json();

  return (
    <div className="absolute top-0 inset-0 flex h-full  bg-[#f7f7f7] overflow-hidden">
      {/* Image side */}
      <div className="relative mt-18 flex-1 flex  justify-center bg-[#f7f7f7] py-8">
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-full  rounded-xl object-contain"
        />
        {/* Close button */}
        <Link
          href="/"
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </Link>
      </div>

      {/* Info panel */}
      <div className="w-[300px] sm:w-[400px] p-6 border-l mt-18 border-gray-200 relative">
        <div className="mb-2 text-sm ">{image.author}</div>

        {/* This is now the hoverable group */}
        <div className="group relative p-2 transition-colors duration-300 rounded-lg hover:bg-gray-200 cursor-pointer">
          <p className="text-md font-extralight leading-snug">
            {image.description ?? "No description."}
          </p>

          <span className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            + Use the text
          </span>
        </div>
      </div>
    </div>
  );
}
