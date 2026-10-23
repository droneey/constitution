import type { ThemeMode } from '../constants';
import type { Oklch } from './colour.types';

interface ColourValue {
  readonly alpha?: number;
  readonly colorSpace: 'oklch';
  readonly components: Oklch;
  readonly hex?: string;
}

interface MeasureValue {
  readonly unit: string;
  readonly value: number;
}

interface ShadowLayer {
  readonly blur: MeasureValue;
  readonly color: ColourValue;
  readonly offsetX: MeasureValue;
  readonly offsetY: MeasureValue;
  readonly spread: MeasureValue;
}

/** a reference is written `{group.name}`; a list of numbers is a cubic Bézier */
type TokenValue =
  | ColourValue
  | MeasureValue
  | number
  | string
  | readonly number[]
  | readonly ShadowLayer[];

interface DesignToken {
  readonly $description?: string;
  readonly $value: TokenValue;
}

/** a string member is the group's `$type` or `$description` */
interface DesignTokenGroup {
  readonly [name: string]: DesignToken | DesignTokenGroup | string;
}

/** by dotted path */
type DesignTokens = ReadonlyMap<string, DesignToken>;

type ModeTokens = Readonly<Record<ThemeMode, DesignTokens>>;

export type {
  ColourValue,
  DesignToken,
  DesignTokenGroup,
  DesignTokens,
  MeasureValue,
  ModeTokens,
  ShadowLayer,
  TokenValue,
};
