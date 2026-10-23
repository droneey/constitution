enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

enum TokenGroupPath {
  Colour = 'color.',
  Duration = 'duration.',
  Spacing = 'spacing.',
}

const ACCENT_SCALE = `${TokenGroupPath.Colour}brand`;

export { ACCENT_SCALE, ThemeMode, TokenGroupPath };
