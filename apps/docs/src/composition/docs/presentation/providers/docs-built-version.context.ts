import { createContext } from 'react';

import type { Version } from '#/features/versions';

export const DocsBuiltVersionContext = createContext<Version | undefined>(undefined);
