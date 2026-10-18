// WCAG 2's relative luminance and contrast ratio.
const RED_LUMINANCE = 0.2126;
const GREEN_LUMINANCE = 0.7152;
const BLUE_LUMINANCE = 0.0722;
const LUMINANCE_WEIGHTS = [
  RED_LUMINANCE,
  GREEN_LUMINANCE,
  BLUE_LUMINANCE,
] as const;
const CONTRAST_FLARE = 0.05;

/** the scopes of a code theme whose colours code text is written in */
const CODE_SCOPES =
  /(^|[ ,])(comment|string|constant\.numeric|constant\.language|keyword|storage|entity\.name\.function|entity\.name\.type|support\.function|variable)\b/;

/** the colour a code theme gives text no scope colours */
const EDITOR_FOREGROUND = 'editor.foreground';

// The report: the mode padded to the longest one, and a ratio to two places.
const MODE_LABEL_WIDTH = 5;
const RATIO_DIGITS = 2;

export {
  CODE_SCOPES,
  CONTRAST_FLARE,
  EDITOR_FOREGROUND,
  LUMINANCE_WEIGHTS,
  MODE_LABEL_WIDTH,
  RATIO_DIGITS,
};
