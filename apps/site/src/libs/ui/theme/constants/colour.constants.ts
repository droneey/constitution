// OKLab to linear sRGB, by Björn Ottosson's matrices: the first turns lightness, a and b into the
// cube roots of the long, medium and short cone responses, the second turns the responses into red,
// green and blue. Lightness weighs 1 in every root.
const LONG_FROM_A = 0.396_337_777_4;
const LONG_FROM_B = 0.215_803_757_3;
const MEDIUM_FROM_A = -0.105_561_345_8;
const MEDIUM_FROM_B = -0.063_854_172_8;
const SHORT_FROM_A = -0.089_484_177_5;
const SHORT_FROM_B = -1.291_485_548;

const RED_FROM_LONG = 4.076_741_662_1;
const RED_FROM_MEDIUM = -3.307_711_591_3;
const RED_FROM_SHORT = 0.230_969_929_2;
const GREEN_FROM_LONG = -1.268_438_004_6;
const GREEN_FROM_MEDIUM = 2.609_757_401_1;
const GREEN_FROM_SHORT = -0.341_319_396_5;
const BLUE_FROM_LONG = -0.004_196_086_3;
const BLUE_FROM_MEDIUM = -0.703_418_614_7;
const BLUE_FROM_SHORT = 1.707_614_701;

const OKLAB_TO_LMS_ROOTS = [
  [
    1,
    LONG_FROM_A,
    LONG_FROM_B,
  ],
  [
    1,
    MEDIUM_FROM_A,
    MEDIUM_FROM_B,
  ],
  [
    1,
    SHORT_FROM_A,
    SHORT_FROM_B,
  ],
] as const;

const LMS_TO_LINEAR_SRGB = [
  [
    RED_FROM_LONG,
    RED_FROM_MEDIUM,
    RED_FROM_SHORT,
  ],
  [
    GREEN_FROM_LONG,
    GREEN_FROM_MEDIUM,
    GREEN_FROM_SHORT,
  ],
  [
    BLUE_FROM_LONG,
    BLUE_FROM_MEDIUM,
    BLUE_FROM_SHORT,
  ],
] as const;

const LMS_EXPONENT = 3;
const DEGREES_PER_HALF_TURN = 180;

// The sRGB transfer function of IEC 61966-2-1, from an encoded channel to linear light.
const SRGB_LINEAR_LIMIT = 0.040_45;
const SRGB_LINEAR_SLOPE = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;

// A colour written #rrggbb: two hexadecimal digits a channel, after the hash.
const RED_HEX_START = 1;
const GREEN_HEX_START = 3;
const BLUE_HEX_START = 5;
const HEX_CHANNEL_STARTS = [
  RED_HEX_START,
  GREEN_HEX_START,
  BLUE_HEX_START,
] as const;
const HEX_DIGITS_PER_CHANNEL = 2;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;

export {
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
};
