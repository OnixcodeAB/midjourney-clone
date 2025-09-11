  // Function to calculate aspect ratio
  export const calculateAspectRatio = (width: number, height: number): Aspect => {
    const ratio = width / height;

    if (ratio >= 0.9 && ratio <= 1.1) {
      return "1024x1024"; // Square or near-square
    } else if (ratio > 1.1) {
      return "1536x1024"; // Landscape (width > height)
    } else {
      return "1024x1536"; // Portrait (height > width)
    }
  };