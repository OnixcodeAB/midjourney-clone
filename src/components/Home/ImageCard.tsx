interface Props {
  src: string;
  alt: string;
  author: string;
  description: string;
}

export default function ImageCard({ src, alt, author, description }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl break-inside-avoid shadow-md group">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-lg px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="block truncate">by {author}</span>
      </div>
    </div>
  );
}
