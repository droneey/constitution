/** three numbers, in the order a colour space names them */
type ColourTriple = readonly [
  number,
  number,
  number,
];

/** red, green and blue in linear light, each from 0 to 1 */
type LinearRgb = ColourTriple;

/** lightness from 0 to 1, chroma, and hue in degrees */
type Oklch = ColourTriple;

export type { ColourTriple, LinearRgb, Oklch };
