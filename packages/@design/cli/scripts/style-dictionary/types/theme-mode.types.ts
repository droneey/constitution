/** one mode of the tokens' `theme` modifier, as the runner of `@droneey/design-tokens` hands it to the configuration */
interface ThemeMode {
  readonly isDefault: boolean;
  readonly name: string;
}

export type { ThemeMode };
