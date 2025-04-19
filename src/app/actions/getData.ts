"use server";

export async function getData() {
  // Fetch from DB or external API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/images`);
  return res.json();
}
