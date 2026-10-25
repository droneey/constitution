import type { DocumentFrame } from '../../../contracts';

/** whether the open sidebar would push the page out of view */
export type IsScreenNarrow = () => boolean;

export const createIsScreenNarrow =
  (frame: DocumentFrame): IsScreenNarrow =>
  (): boolean =>
    frame.isNarrow();
