import { createContext } from 'react';

import type { GetVersions } from '../../domain/use-cases';

export const GetVersionsContext = createContext<GetVersions | undefined>(undefined);
