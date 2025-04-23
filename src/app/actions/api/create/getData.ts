"use server";

export async function getData() {
  // Fetch from DB or external API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${process.env.PORT}/api/create`, {
    cache: "no-store", // optional: ensure fresh data
    //next: { revalidate: 60 }, // optional: revalidate every 60 seconds
  });
  return res.json();
}
