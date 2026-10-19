import type { Oklch } from './colour.types';

/** a colour of the W3C format */
interface ColourValue {
  readonly colorSpace: 'oklch';
  readonly components: Oklch;
}

/** a dimension or a duration of the W3C format */
interface MeasureValue {
  readonly unit: string;
  readonly value: number;
}

/** a reference is written `{group.name}`; a list of numbers is a cubic Bézier */
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

/** a string is the group's `$type` or `$description` */
interface DesignTokenGroup {
  readonly [name: string]: DesignToken | DesignTokenGroup | string;
}

/** by dotted path, in the order the source lists them */
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
