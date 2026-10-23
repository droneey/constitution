enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

enum TokenGroupPath {
  Colour = 'color.',
  Dimension = 'dimension.',
  Duration = 'duration.',
  Ease = 'ease.',
  FontWeight = 'font.weight.',
  Layer = 'layer.',
  Leading = 'leading.',
  Radius = 'radius.',
  Ring = 'ring.',
  Scale = 'scale.',
  Shadow = 'shadow.',
  Size = 'size.',
  Spacing = 'spacing.',
  Stroke = 'stroke.',
  Text = 'text.',
}

const ACCENT_SCALE = `${TokenGroupPath.Colour}brand`;

export { ACCENT_SCALE, ThemeMode, TokenGroupPath };
