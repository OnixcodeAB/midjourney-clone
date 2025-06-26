"use server";

export async function getAllData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${process.env.PORT}/api/images`);
  if (!res.ok) {
    const text = await res.text(); // Get the response as text
    console.error("Error response:", text); // Log the error response
    throw new Error("Failed to fetch data");
  }
  return res.json();
}