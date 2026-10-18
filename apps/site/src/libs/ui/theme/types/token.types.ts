import type { Oklch } from './colour.types';

/** a colour of the W3C format, in the one space the theme writes */
interface ColourValue {
  readonly colorSpace: 'oklch';
  readonly components: Oklch;
}

/** a dimension or a duration of the W3C format */
interface MeasureValue {
  readonly unit: string;
  readonly value: number;
}

/** a raw value, a reference written `{group.name}`, or a list of numbers such as a cubic Bézier */
type TokenValue = ColourValue | MeasureValue | number | string | readonly number[];

/** the value a token takes in the dark mode, in place of its own */
interface TokenModes {
  readonly dark: number | string;
}

interface TokenExtensions {
  /** the share of the colour laid over the base surface, from 0 to 1 */
  readonly 'dev.droneey.share'?: number;
  readonly mode?: TokenModes;
}

interface DesignToken {
  readonly $description?: string;
  readonly $extensions?: TokenExtensions;
  readonly $value: TokenValue;
}

/** a group of tokens and groups by name, with its `$type` and `$description` beside them */
interface DesignTokenGroup {
  readonly [name: string]: DesignToken | DesignTokenGroup | string;
}

/** every token by its dotted path, in the order the source lists them */
type DesignTokens = ReadonlyMap<string, DesignToken>;

export type {
  ColourValue,
  DesignToken,
  DesignTokenGroup,
  DesignTokens,
  MeasureValue,
  TokenExtensions,
  TokenModes,
  TokenValue,
};
