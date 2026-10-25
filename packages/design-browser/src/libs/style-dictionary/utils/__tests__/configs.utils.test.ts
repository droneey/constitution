import { describe, expect, it } from 'bun:test';

import { HEADER, outputsOf } from './configs.fixtures';

describe('configsOf', () => {
  it("should write every token of the default mode on the root, a role naming its step, Tailwind's theme with its radius names, and the durations of reduced motion", async () => {
    // Arrange
    const build = outputsOf();

    // Act
    const [light] = await build;

    // Assert
    expect(light).toStrictEqual({
      'theme/light.gen.css': `${HEADER}:root {
  --color-neutral-0: oklch(1.0000 0.0000 286.00);
  --color-neutral-900: oklch(0.1900 0.0050 286.00);
  --color-brand-600: oklch(0.5500 0.2100 318.00);
  --color-overlay-neutral-900-6: oklch(0.1900 0.0050 286.00 / 0.06);
  --dimension-8: 0.5rem;
  --dimension-16: 1rem;
  --radius-8: 0.5rem;
  --shadow-drop-sm: 0px 4px 6px -4px oklch(0% 0 0 / 0.1);
  --duration-fast: 0.1s;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --layer-50: 50;
  --font-weight-normal: 400;
  --stroke-icon: 2.25;
  --color-surface-base: var(--color-neutral-0);
  --color-accent-solid: var(--color-brand-600);
  --color-fill-hover: var(--color-overlay-neutral-900-6);
  --spacing-sm: var(--dimension-16);
  --size-icon-md: var(--dimension-16);
  --text-sm: var(--dimension-16);
  --leading-sm: var(--dimension-8);
  --radius-surface-raised: var(--radius-8);
  --shadow-surface-raised: var(--shadow-drop-sm);
  --layer-surface-raised: var(--layer-50);
}
`,
      'theme/tailwind.gen.css': `${HEADER}@theme inline reference {
  --color-surface-base: var(--color-surface-base);
  --color-accent-solid: var(--color-accent-solid);
  --color-fill-hover: var(--color-fill-hover);
  --spacing-sm: var(--spacing-sm);
  --size-icon-md: var(--size-icon-md);
  --spacing-icon-md: var(--size-icon-md);
  --text-sm: var(--text-sm);
  --leading-sm: var(--leading-sm);
  --text-sm--line-height: var(--leading-sm);
  --radius-surface-raised: var(--radius-surface-raised);
  --shadow-surface-raised: var(--shadow-surface-raised);
  --duration-fast: var(--duration-fast);
  --ease-out: var(--ease-out);
  --layer-surface-raised: var(--layer-surface-raised);
  --z-index-surface-raised: var(--layer-surface-raised);
  --font-weight-normal: var(--font-weight-normal);
  --radius-xs: var(--radius-4);
  --radius-sm: var(--radius-4);
  --radius-md: var(--radius-8);
  --radius-lg: var(--radius-8);
  --radius-xl: var(--radius-12);
  --radius-2xl: var(--radius-16);
  --radius-3xl: var(--radius-24);
  --radius-4xl: var(--radius-32);
}
`,
      'theme/reduced-motion.gen.css': `${HEADER}@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0s;
  }
}
`,
    });
  });

  it("should write only another mode's own tokens, under its class", async () => {
    // Arrange
    const build = outputsOf();

    // Act
    const [, dark] = await build;

    // Assert
    expect(dark).toStrictEqual({
      'theme/dark.gen.css': `${HEADER}.dark {
  --font-weight-normal: 370;
  --stroke-icon: 1.75;
  --color-surface-base: var(--color-neutral-900);
  --color-accent-solid: var(--color-brand-600);
  --color-fill-hover: var(--color-overlay-neutral-900-6);
}
`,
    });
  });
});
