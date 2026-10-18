import {
  CHANNEL_MAX,
  DEGREES_PER_HALF_TURN,
  HEX_CHANNEL_STARTS,
  HEX_DIGITS_PER_CHANNEL,
  HEX_RADIX,
  LMS_EXPONENT,
  LMS_TO_LINEAR_SRGB,
  OKLAB_TO_LMS_ROOTS,
  SRGB_GAMMA,
  SRGB_LINEAR_LIMIT,
  SRGB_LINEAR_SLOPE,
  SRGB_OFFSET,
  SRGB_SCALE,
} from '../constants';
import type { ColourTriple, LinearRgb, Oklch } from '../types';

const dotProduct = ([x, y, z]: ColourTriple, [p, q, r]: ColourTriple): number =>
  x * p + y * q + z * r;

const clampChannel = (channel: number): number => Math.min(1, Math.max(0, channel));

/** an OKLCH colour in linear sRGB, each channel clamped into the gamut */
const oklchToLinearSrgb = ([lightness, chroma, hue]: Oklch): LinearRgb => {
  const radians = (hue * Math.PI) / DEGREES_PER_HALF_TURN;
  const lab: ColourTriple = [
    lightness,
    chroma * Math.cos(radians),
    chroma * Math.sin(radians),
  ];
  const [toLong, toMedium, toShort] = OKLAB_TO_LMS_ROOTS;
  const cones: ColourTriple = [
    dotProduct(toLong, lab) ** LMS_EXPONENT,
    dotProduct(toMedium, lab) ** LMS_EXPONENT,
    dotProduct(toShort, lab) ** LMS_EXPONENT,
  ];
  const [toRed, toGreen, toBlue] = LMS_TO_LINEAR_SRGB;

  return [
    clampChannel(dotProduct(toRed, cones)),
    clampChannel(dotProduct(toGreen, cones)),
    clampChannel(dotProduct(toBlue, cones)),
  ];
};

const decodeChannel = (encoded: number): number =>
  // Stryker disable next-line EqualityOperator: no channel of 8 bits lands on the limit, so < and <= agree
  encoded <= SRGB_LINEAR_LIMIT
    ? encoded / SRGB_LINEAR_SLOPE
    : ((encoded + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA;

const channelAt = (hex: string, start: number): number =>
  decodeChannel(
    Number.parseInt(hex.slice(start, start + HEX_DIGITS_PER_CHANNEL), HEX_RADIX) / CHANNEL_MAX,
  );

/** a colour written `#rrggbb` in linear sRGB */
const hexToLinearSrgb = (hex: string): LinearRgb => {
  const [red, green, blue] = HEX_CHANNEL_STARTS;

  return [
    channelAt(hex, red),
    channelAt(hex, green),
    channelAt(hex, blue),
  ];
};

/** a colour laid over another with the share of it that covers the other */
const mixLinearSrgb = (
  [overRed, overGreen, overBlue]: LinearRgb,
  [underRed, underGreen, underBlue]: LinearRgb,
  share: number,
): LinearRgb => [
  overRed * share + underRed * (1 - share),
  overGreen * share + underGreen * (1 - share),
  overBlue * share + underBlue * (1 - share),
];

export { dotProduct, hexToLinearSrgb, mixLinearSrgb, oklchToLinearSrgb };
