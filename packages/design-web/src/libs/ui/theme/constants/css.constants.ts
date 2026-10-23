const PIXELS_PER_REM = 16;

/** Tailwind's radius names, each on the radius primitive of its pixels */
const TAILWIND_RADIUS: Readonly<Record<string, number>> = {
  xs: 4,
  sm: 4,
  md: 8,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
};

export { PIXELS_PER_REM, TAILWIND_RADIUS };
