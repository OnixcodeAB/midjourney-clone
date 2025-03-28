import { NextResponse } from "next/server";

const images = [
  {
    id: 1,
    src: "https://picsum.photos/id/1015/400/600",
    alt: "Red Vinyl",
    author: "Alex Rivera",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 2,
    src: "https://picsum.photos/id/1025/400/500",
    alt: "Orange Fantasy",
    author: "Maria Sun",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 3,
    src: "https://picsum.photos/id/1035/400/400",
    alt: "Frog Poster",
    author: "Leo Zhang",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 4,
    src: "https://picsum.photos/id/1045/400/600",
    alt: "Desert Horse",
    author: "Nina Gray",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 5,
    src: "https://picsum.photos/id/1055/400/450",
    alt: "Anime Sheet",
    author: "Yuki Sato",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 6,
    src: "https://picsum.photos/id/1055/400/450",
    alt: "Anime Sheet",
    author: "Carlos V.",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 7,
    src: "https://picsum.photos/id/1055/400/450",
    alt: "Anime Sheet",
    author: "Emma Field",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 8,
    src: "https://picsum.photos/id/1065/400/550",
    alt: "Wood Texture",
    author: "Jasper Lim",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 9,
    src: "https://picsum.photos/id/1065/400/550",
    alt: "Wood Texture",
    author: "Olivia Park",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 10,
    src: "https://picsum.photos/id/1075/400/600",
    alt: "Swans Love",
    author: "Theo Blaze",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
  {
    id: 11,
    src: "https://picsum.photos/id/1075/400/600",
    alt: "Swans Love",
    author: "Theo Blaze",
    description:
      "create A black cat in , dancing in a simple drawing style on a white background. Digital art in the style of crayon or pastel sketch style",
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const image = images.find((img) => img.id === Number(id));
  if (!image) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(image);
}
