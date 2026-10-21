import type { DocsFrame } from '../app/providers';

export interface FrameFake {
  frame: DocsFrame;
  /** oldest first */
  marks: boolean[];
}

export const frameFake = ({ narrow = false }: { narrow?: boolean } = {}): FrameFake => {
  const marks: boolean[] = [];

  return {
    frame: {
      isNarrow: (): boolean => narrow,
      markSidebar: (collapsed: boolean): void => {
        marks.push(collapsed);
      },
    },
    marks,
  };
};
