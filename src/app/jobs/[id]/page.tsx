import JobsDetailPanel from "@/components/Jobs/JobsDetailPanel";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const [type, actualId] = id.split("_");

  const endpoint =
    type === "create"
      ? `/api/create/${actualId}`
      : type === "img"
      ? `/api/images/${actualId}`
      : null;

  if (!endpoint) notFound();

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${process.env.PORT}${endpoint}`, {
    cache: "default",
  });

  if (!res.ok) notFound();

  const image = await res.json();

  return <JobsDetailPanel image={image} />;
}
