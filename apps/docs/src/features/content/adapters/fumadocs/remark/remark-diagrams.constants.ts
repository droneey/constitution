const DIAGRAM_SPACING_PX = 32;

const DIAGRAM_COLOURS = {
  accent: 'var(--color-accent-solid)',
  bg: 'var(--color-surface-base)',
  border: 'color-mix(in oklch, var(--color-accent-solid) 45%, transparent)',
  fg: 'var(--color-text-primary)',
  line: 'color-mix(in oklch, var(--color-accent-solid) 60%, var(--color-text-muted))',
  muted: 'var(--color-text-muted)',
  surface: 'color-mix(in oklch, var(--color-accent-solid) 7%, var(--color-surface-level-1))',
} as const;

export { DIAGRAM_COLOURS, DIAGRAM_SPACING_PX };
