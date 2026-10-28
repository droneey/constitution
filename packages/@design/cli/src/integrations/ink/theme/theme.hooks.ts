import { use } from 'react';

import type { Theme } from '#/libs/ui';

import { ThemeContext } from './theme.context';

const useTheme = (): Theme => use(ThemeContext);

export { useTheme };
