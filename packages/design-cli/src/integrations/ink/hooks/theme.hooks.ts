import { use } from 'react';

import type { Theme } from '#/libs/ui';

import { ThemeContext } from '../components/theme-provider';

const useTheme = (): Theme => use(ThemeContext);

export { useTheme };
