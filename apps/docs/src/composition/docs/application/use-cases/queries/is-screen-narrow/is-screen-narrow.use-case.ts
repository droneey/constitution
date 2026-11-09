import type { DocumentFrame } from '../../../contracts';

export type IsScreenNarrow = () => boolean;

export const createIsScreenNarrow =
  (frame: DocumentFrame): IsScreenNarrow =>
  (): boolean =>
    frame.isNarrow();
