import type { DocsFrame } from '../app/providers';

/** a frame that records what the sidebar tells it */
export interface FrameFake {
  frame: DocsFrame;
  /** each state the sidebar marked, oldest first */
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
