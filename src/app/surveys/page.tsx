import InpaintingCanvas from "@/components/surveys/InpaintingCanvas";

export default async function SurveysPage() {
  return (
    <div className="w-full h-screen">
      <InpaintingCanvas imageUrl="https://res.cloudinary.com/dfmynuds5/image/upload/v1754761850/ai_gallery/user_2xxmYYwGCHWaSbbmULYdOpOfuN3-1754761850054.png" />
    </div>
  );
}
