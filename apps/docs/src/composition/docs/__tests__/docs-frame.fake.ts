import type { DocumentFrame } from '../domain/contracts';
import type { SidebarState } from '../domain/entities';

interface FrameFakeInput {
  readonly narrow?: boolean;
}

export interface FrameFake {
  frame: DocumentFrame;
  /** oldest first */
  marks: SidebarState[];
}

export const frameFake = ({ narrow = false }: FrameFakeInput = {}): FrameFake => {
  const marks: SidebarState[] = [];

  return {
    frame: {
      isNarrow: (): boolean => narrow,
      markSidebar: (state): void => {
        marks.push(state);
      },
    },
    marks,
  };
};
