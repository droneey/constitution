import { createContext } from 'react';

import type { IsScreenNarrow } from '../../../../application/use-cases/queries/is-screen-narrow';

export const IsScreenNarrowContext = createContext<IsScreenNarrow | undefined>(undefined);
