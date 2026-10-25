import { createContext } from 'react';

import type { SearchPages } from '../../domain/use-cases';

export const SearchPagesContext = createContext<SearchPages | undefined>(undefined);
