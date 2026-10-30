import type { TocHeading, TocTrackedHeading } from '#/libs/ui';

interface TopmostHeading {
  heading: TocHeading | undefined;
  position: number;
}

const selectTopmostHeading = (headings: TocTrackedHeading[]): TopmostHeading => {
  const position = headings.findIndex((heading) => heading.active);

  return {
    heading: headings[position]?.original,
    position,
  };
};

export { selectTopmostHeading };
