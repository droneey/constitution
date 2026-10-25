import type { Section, SectionKind } from '#/shared/cli';

// What the view draws: every section but lines of data, which are printed as they are.
type DrawnSection = Exclude<
  Section,
  {
    readonly kind: SectionKind.Lines;
  }
>;

interface SectionViewProps {
  readonly section: DrawnSection;
}

export type { SectionViewProps };
