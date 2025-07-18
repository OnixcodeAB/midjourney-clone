interface Props {
  src: string;
  alt: string;
  author?: string;
  imgClassName?: string;
  showAuthor?: boolean;
}

export default function ImagePreview({
  src,
  alt,
  author,
  imgClassName = "h-auto",
  showAuthor = true,
}: Props) {
  return (
    <div className="relative w-fit overflow-hidden break-inside-avoid shadow-md group border border-border">
      <img src={src} alt={alt} className={`max-w-full ${imgClassName}`} />

      {/* Bottom overlay */}
      <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-4 py-3">
        {showAuthor && (
          <span className="block truncate text-sm font-medium text-white">
            {author ? `${author}` : ""}
          </span>
        )}
      </div>
    
    </div>
  );
}
