import { createContext } from 'react';

import type { SearchPages } from '../../application/use-cases';

export const SearchPagesContext = createContext<SearchPages | undefined>(undefined);
