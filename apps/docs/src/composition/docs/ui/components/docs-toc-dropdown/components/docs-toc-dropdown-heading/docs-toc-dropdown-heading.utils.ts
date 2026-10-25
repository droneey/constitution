import type { TocHeading, TocTrackedHeading } from '#/libs/ui';

/** `position` is -1, before the first heading, when none is on screen */
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
