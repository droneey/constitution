/** a mode of the resolver's `theme` modifier, with the paths of its token files */
interface ThemeMode {
  readonly isDefault: boolean;
  readonly name: string;
  /** the files of the mode's own context */
  readonly own: readonly string[];
  /** the files of every set, which each mode takes */
  readonly shared: readonly string[];
}

export type { ThemeMode };
