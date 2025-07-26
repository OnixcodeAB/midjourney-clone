import { useState, useEffect } from "react";

// Define the shape of our breakpoints
interface Breakpoints {
  small: string;
  medium: string;
  large: string;
  xlarge: string;
  xxlarge: string;
}

// Define the shape of the returned matches object
interface MatchedBreakpoints {
  small: boolean;
  medium: boolean;
  large: boolean;
  xlarge: boolean;
  xxlarge: boolean;
}

// Define your breakpoints in pixels for clarity and consistency with window.matchMedia
// Assuming a base font size of 16px for rem conversion.
const breakpoints: Breakpoints = {
  small: "(min-width: 425px)", // 40rem * 16px/rem = 640px
  medium: "(min-width: 768px)", // 48rem * 16px/rem = 768px
  large: "(min-width: 1024px)", // 64rem * 16px/rem = 1024px
  xlarge: "(min-width: 1280pxpx)", // 80rem * 16px/rem = 1280px
  xxlarge: "(min-width: 1536px)", // 96rem * 16px/rem = 1536px
};

function useMediaQueries(): MatchedBreakpoints {
  // Initialize state based on the current window.matchMedia status.
  // This ensures the initial render is correct.
  const [matches, setMatches] = useState<MatchedBreakpoints>(() => {
    // Check if window is defined (for SSR environments)
    if (typeof window === "undefined") {
      // Return default false for all on server, or a mobile-first default
      return {
        small: false,
        medium: false,
        large: false,
        xlarge: false,
        xxlarge: false,
      };
    }

    const initialState: MatchedBreakpoints = {
      small: false, // Initialize with default values
      medium: false,
      large: false,
      xlarge:false,
      xxlarge: false,
    };

    for (const key in breakpoints) {
      if (Object.hasOwnProperty.call(breakpoints, key)) {
        // Type assertion to ensure 'key' is a valid key of 'breakpoints' and 'initialState'
        const breakpointKey = key as keyof Breakpoints;
        initialState[breakpointKey] = window.matchMedia(
          breakpoints[breakpointKey]
        ).matches;
      }
    }
    return initialState;
  });

  useEffect(() => {
    // Check if window is defined before adding listeners
    if (typeof window === "undefined") {
      return; // Do nothing if on the server
    }

    const mediaQueryLists: { [K in keyof Breakpoints]?: MediaQueryList } = {};
    const handlers: {
      [K in keyof Breakpoints]?: (event: MediaQueryListEvent) => void;
    } = {};

    for (const key in breakpoints) {
      if (Object.hasOwnProperty.call(breakpoints, key)) {
        const breakpointKey = key as keyof Breakpoints;
        const mediaQuery = window.matchMedia(breakpoints[breakpointKey]);
        mediaQueryLists[breakpointKey] = mediaQuery;

        handlers[breakpointKey] = (event: MediaQueryListEvent) => {
          setMatches((prevMatches) => ({
            ...prevMatches,
            [breakpointKey]: event.matches,
          }));
        };

        // For older browsers, you might need addListener/removeListener
        // For modern browsers, addEventListener/removeEventListener is preferred
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener(
            "change",
            handlers[breakpointKey] as EventListener
          );
        } else {
          // Fallback for older browsers
          mediaQuery.addListener(
            handlers[breakpointKey] as Parameters<
              typeof mediaQuery.addListener
            >[0]
          );
        }
      }
    }

    // Cleanup function to remove all listeners
    return () => {
      for (const key in mediaQueryLists) {
        if (Object.hasOwnProperty.call(mediaQueryLists, key)) {
          const breakpointKey = key as keyof Breakpoints;
          const mediaQuery = mediaQueryLists[breakpointKey];
          const handler = handlers[breakpointKey];

          if (mediaQuery && handler) {
            if (mediaQuery.removeEventListener) {
              mediaQuery.removeEventListener(
                "change",
                handler as EventListener
              );
            } else {
              mediaQuery.removeListener(
                handler as Parameters<typeof mediaQuery.removeListener>[0]
              );
            }
          }
        }
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return matches;
}

export default useMediaQueries;
