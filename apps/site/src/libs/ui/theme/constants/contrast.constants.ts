/** the scopes of a code theme whose colours code text is written in */
const CODE_SCOPES =
  /(^|[ ,])(comment|string|constant\.numeric|constant\.language|keyword|storage|entity\.name\.function|entity\.name\.type|support\.function|variable)\b/;

/** the colour a code theme gives text no scope colours */
const EDITOR_FOREGROUND = 'editor.foreground';

// The report: the mode padded to the longest one, and a ratio to two places.
const MODE_LABEL_WIDTH = 5;
const RATIO_DIGITS = 2;

export { CODE_SCOPES, EDITOR_FOREGROUND, MODE_LABEL_WIDTH, RATIO_DIGITS };
