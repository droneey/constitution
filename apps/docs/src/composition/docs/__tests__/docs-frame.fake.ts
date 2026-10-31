import type { DocumentFrame } from '../application/contracts';
import type { SidebarState } from '../domain/sidebar-state/entities';

interface FrameFakeInput {
  readonly narrow?: boolean;
}

export interface FrameFake {
  frame: DocumentFrame;
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
