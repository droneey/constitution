/** in the order the report lists them */
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
  Leading = 'leading.',
  Radius = 'radius.',
  Size = 'size.',
  Spacing = 'spacing.',
  Stroke = 'stroke.',
  Text = 'text.',
}

/** the surface a colour with a share of its own is laid over */
const BASE_SURFACE = `${TokenGroupPath.Colour}surface.base`;

const GRID_GROUPS: readonly TokenGroupPath[] = [
  TokenGroupPath.Spacing,
  TokenGroupPath.Size,
  TokenGroupPath.Dimension,
  TokenGroupPath.Text,
  TokenGroupPath.Leading,
];

export { BASE_SURFACE, GRID_GROUPS, ThemeMode, TokenGroupPath };
