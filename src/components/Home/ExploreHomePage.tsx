"use client";

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { LayoutPanelTop, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { checkIfUserExists } from "@/app/actions/user/checkIfUserExists";
import { getImagesPaginated } from "@/app/actions/image/getImagesPaginated";
import { MasonryImageGallery } from "../Masonry/MasonryImageGallery";
import useMediaQueries from "@/hooks/useMediaQueries";

interface Props {
  initialImages: ImageExplorePage[];
}

const breakpointCols = {
  default: 6,
  small: 2,
  medium: 2,
  large: 3,
  xlarge: 4,
  xxlarge: 5,
};

export const ExploreHomePage = ({ initialImages }: Props) => {
  const { user } = useUser();
  const [userExists, setUserExists] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { small, medium, large, xlarge, xxlarge } = useMediaQueries();
  const [columns, setColumns] = useState(breakpointCols.default);

  const [filter, setFilter] = useState<{
    searchText: string;
    tags: string[];
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (user && user.id) {
        const exists = await checkIfUserExists(user.id);
        setUserExists(exists);
      }
    };
    checkUser();
  }, [user]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        loadMoreImages();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, hasMore]);

  useEffect(() => {
    // Determine the active breakpoint and set columns accordingly.
    // Order matters here: start from the largest breakpoint and go down.
    if (xxlarge && breakpointCols.xxlarge) {
      // Assuming 1440px for xxlarge based on your prop
      setColumns(breakpointCols.xxlarge);
    } else if (xlarge && breakpointCols.xlarge) {
      setColumns(breakpointCols.xlarge);
    } else if (large && breakpointCols.large) {
      setColumns(breakpointCols.large);
    } else if (medium && breakpointCols.medium) {
      setColumns(breakpointCols.medium);
    } else if (small && breakpointCols.small) {
      setColumns(breakpointCols.small);
    } else {
      // If none of the specific breakpoints match, or if the smallest breakpoint
      // is not met, fall back to the default.
      setColumns(breakpointCols.default);
    }
  }, [small, medium, large, xxlarge, breakpointCols]);

  const loadMoreImages = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const limit = 10;
    const offset = page * limit;
    const result = await getImagesPaginated(user?.id || null, limit, offset);

    if (result.data) {
      const newImages = result.data.filter(
        (newImg) => !images.some((img) => img.id === newImg.id)
      );

      setImages((prevImages) => [...prevImages, ...newImages]);
      setPage((prevPage) => prevPage + 1);

      if (result.data.length < limit) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  const displayed = useMemo(() => {
    if (!filter) return images;
    const searchLower = filter.searchText?.toLowerCase() || "";
    return images.filter((img) => {
      const imgSearch = img.search_text?.toLowerCase() || "";
      const matchesText = imgSearch.includes(searchLower);
      const matchesTag = img.tags.some((t) => filter.tags.includes(t));
      return matchesText || matchesTag;
    });
  }, [images, filter]);

  const handleSearch = useCallback((searchText: string, tags: string[]) => {
    setFilter({ searchText, tags });
  }, []);

  const handleClick = (id: number) => {
    router.push(`/jobs/img_${id}`);
  };

  return (
    <div className="w-full m-auto bg-background flex flex-column items-center justify-center">
      <div className="w-full">
        {filter && (
          <div className="sticky top-4 m-0 ml-1.5 left-0 z-50 flex items-center w-fit bg-card/50 text-card-foreground px-3 py-2 rounded-r-full shadow-md gap-2 mb-4 backdrop-blur-sm border border-border">
            <LayoutPanelTop className="w-5 h-5 opacity-90" />
            <span className="font-medium">{filter.searchText}</span>
            <button
              type="button"
              className="ml-1 p-1 rounded-full hover:bg-accent transition-colors"
              onClick={() => setFilter(null)}
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
        <div className=" w-full flex xl:justify-center h-full">
          <MasonryImageGallery
            images={displayed}
            columnsCount={columns}
            handleOnSearch={handleSearch}
            handleOnClick={handleClick}
            isAuthenticated={userExists}
          />
        </div>

        {!hasMore && (
          <div className="w-full text-center py-6 text-sm border-t border-border mt-6 bg-background">
            <p className="text-muted-foreground/50 text-lg font-medium">
              No hay más imágenes para mostrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
