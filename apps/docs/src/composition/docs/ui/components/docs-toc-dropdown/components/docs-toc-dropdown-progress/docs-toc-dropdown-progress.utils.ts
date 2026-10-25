import type { TocTrackedHeading } from '#/libs/ui';

const selectReadShare = (headings: Pick<TocTrackedHeading, 'active'>[]): number =>
  (headings.findLastIndex((heading) => heading.active) + 1) / Math.max(1, headings.length);

export { selectReadShare };
