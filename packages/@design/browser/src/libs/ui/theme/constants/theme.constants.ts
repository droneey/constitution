const ACCENT_TOKEN_PATH = [
  'color',
  'brand',
] as const;

const accentPropertyPrefix = `--${ACCENT_TOKEN_PATH.join('-')}`;

export { ACCENT_TOKEN_PATH, accentPropertyPrefix };
