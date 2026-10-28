/** where an app's brand.tokens.json holds the scale that replaces the default's */
const ACCENT_TOKEN_PATH = [
  'color',
  'brand',
] as const;

/** the custom properties of that scale's steps, named as the build names a token by its path */
const accentPropertyPrefix = `--${ACCENT_TOKEN_PATH.join('-')}`;

export { ACCENT_TOKEN_PATH, accentPropertyPrefix };
