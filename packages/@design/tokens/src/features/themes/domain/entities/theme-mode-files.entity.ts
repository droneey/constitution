import type { AbsolutePath } from '../value-objects';
import type { ThemeMode } from './theme-mode.entity';

interface ThemeModeFiles extends ThemeMode {
  /** the files of the mode's own context */
  readonly ownPaths: readonly AbsolutePath[];
  /** the files of every set, which each mode takes */
  readonly sharedPaths: readonly AbsolutePath[];
}

export type { ThemeModeFiles };
