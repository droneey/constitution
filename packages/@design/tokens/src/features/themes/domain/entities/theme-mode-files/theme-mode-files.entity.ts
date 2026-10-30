import type { AbsolutePath } from '../../value-objects';
import type { ThemeMode } from '../theme-mode/theme-mode.entity';

interface ThemeModeFiles extends ThemeMode {
  readonly ownPaths: readonly AbsolutePath[];
  readonly sharedPaths: readonly AbsolutePath[];
}

export type { ThemeModeFiles };
