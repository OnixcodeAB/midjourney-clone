interface Props {
  src: string;
  alt: string;
  author?: string;
  description?: string;
  children?: React.ReactNode; // 👈 added
  imgClassName?: string;
}

export default function ImageCard({
  src,
  alt,
  author,
  description,
  imgClassName = "h-auto",
  children,
}: Props) {
  return (
    <div className="relative w-fit overflow-hidden break-inside-avoid shadow-md group">
      <img
        src={src}
        alt={alt}
        className={`max-w-full  transition-transform duration-300 group-hover:scale-105 ${imgClassName}`}
      />

      {/* Bottom overlay (author) */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-lg px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="block truncate">by {author}</span>
      </div>

      {/* Extra overlays passed by parent */}
      {children}
    </div>
  );
}
