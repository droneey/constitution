/** the modes the theme resolves every semantic token in, in the order it reports them */
enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

/** the path every token of a group starts with */
enum TokenGroupPath {
  Colour = 'color.',
  Dimension = 'dimension.',
  Duration = 'duration.',
  Ease = 'ease.',
  FontWeight = 'font.weight.',
  Radius = 'radius.',
  Size = 'size.',
  Spacing = 'spacing.',
  Stroke = 'stroke.',
}

/** the surface a colour with a share of its own is laid over */
const BASE_SURFACE = `${TokenGroupPath.Colour}surface.base`;

/** the groups whose tokens are sizes, each held to the grid */
const GRID_GROUPS: readonly TokenGroupPath[] = [
  TokenGroupPath.Spacing,
  TokenGroupPath.Size,
  TokenGroupPath.Dimension,
];

export { BASE_SURFACE, GRID_GROUPS, ThemeMode, TokenGroupPath };
