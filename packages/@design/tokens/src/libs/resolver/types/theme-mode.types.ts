/** one mode of the resolver's `theme` modifier, as a platform's configuration receives it */
interface ThemeMode {
  readonly isDefault: boolean;
  readonly name: string;
}

export type { ThemeMode };
