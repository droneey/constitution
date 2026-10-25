/** the paths of the token files one mode of the resolver's `theme` modifier reads */
interface ThemeModeFiles {
  readonly isDefault: boolean;
  readonly name: string;
  /** the files of the mode's own context */
  readonly own: readonly string[];
  /** the files of every set, which each mode takes */
  readonly shared: readonly string[];
}

export type { ThemeModeFiles };
