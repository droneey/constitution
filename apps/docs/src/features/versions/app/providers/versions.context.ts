import { createContext } from 'react';

import type { GetVersions } from '../../domain/use-cases';

/** the use case the root builds, for the binding units of the releases */
export const GetVersionsContext = createContext<GetVersions | undefined>(undefined);
