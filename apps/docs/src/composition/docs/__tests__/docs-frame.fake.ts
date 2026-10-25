import type { DocsFrame } from '../app/providers';

interface FrameFakeInput {
  readonly narrow?: boolean;
}

export enum FrameMark {
  Collapsed = 'collapsed',
  Open = 'open',
}

export interface FrameFake {
  frame: DocsFrame;
  /** oldest first */
  marks: FrameMark[];
}

export const frameFake = ({ narrow = false }: FrameFakeInput = {}): FrameFake => {
  const marks: FrameMark[] = [];

  return {
    frame: {
      isNarrow: (): boolean => narrow,
      markSidebarCollapsed: (): void => {
        marks.push(FrameMark.Collapsed);
      },
      markSidebarOpen: (): void => {
        marks.push(FrameMark.Open);
      },
    },
    marks,
  };
};
