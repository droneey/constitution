import { createContext } from 'react';

import type { GetVersions } from '../../application/use-cases';

export const GetVersionsContext = createContext<GetVersions | undefined>(undefined);
