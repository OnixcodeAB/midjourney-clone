export const splitIntoColumns = <T>(data: T[], columns: number): T[][] => {
  const columnLength = Math.ceil(data.length / columns);
  const result: T[][] = [];

  for (let i = 0; i < columns; i++) {
    const start = i * columnLength;
    const end = start + columnLength;
    result.push(data.slice(start, end));
  }

  return result;
};

interface HasDimensions {
  width: number;
  height: number;
}

export const splitIntoMasonryColumns = <T extends ImageExplorePage>(
  data: T[],
  columns: number
): T[][] => {
  const result: T[][] = Array.from({ length: columns }, () => []);
  const columnHeights = new Array(columns).fill(0);

  data.forEach((item) => {
    const aspectRatio =
      item.width && item.height ? item.height / item.width : 1;
    // find column with the smallest height
    const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    result[minColumnIndex].push(item);
    columnHeights[minColumnIndex] += aspectRatio; // increment column height
  });

  return result;
};

export const addImageDimensions = async (
  images: ImageExplorePage[]
): Promise<ImageExplorePage[]> => {
  const promises = images.map((img) => {
    return new Promise<ImageExplorePage>((resolve) => {
      const image = new Image();
      image.src = img.url;
      image.onload = () => {
        resolve({
          ...img,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
    });
  });
  return Promise.all(promises);
};
