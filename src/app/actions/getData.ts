"use server";

export async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${process.env.PORT}/api/create`);
  if (!res.ok) {
    const text = await res.text(); // Get the response as text
    console.error("Error response:", text); // Log the error response
    throw new Error("Failed to fetch data");
  }
  return res.json();
}