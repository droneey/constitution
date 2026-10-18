import type { ThemeMode } from '../constants';
import type { ThemeSettings } from './theme.types';
import type { DesignTokens } from './token.types';

/** one rule of a TextMate theme: the scopes it colours and the colour it gives them */
interface CodeThemeRule {
  readonly scope?: string | readonly string[];
  readonly settings: {
    readonly foreground?: string;
  };
}

/** the part of a code highlighter's theme the contrast check reads */
interface CodeTheme {
  readonly colors?: Readonly<Record<string, string>>;
  readonly tokenColors: readonly CodeThemeRule[];
}

interface ThemeContrastInput {
  readonly codeThemes: Readonly<Record<ThemeMode, CodeTheme>>;
  readonly settings: ThemeSettings;
  readonly tokens: DesignTokens;
}

/** the contrast one pair reached in one mode, and the minimum it must keep */
interface ContrastCheck {
  /** the pair as the report names it */
  readonly label: string;
  readonly minimum: number;
  readonly mode: ThemeMode;
  readonly ratio: number;
  /** the pair as a refusal names it */
  readonly subject: string;
}

export type { CodeTheme, CodeThemeRule, ContrastCheck, ThemeContrastInput };
