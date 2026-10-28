const TOKEN_VALUES = {
  '--size-icon-md': '16px',
  '--stroke-icon': '2.25',
  '--size-popup-min': '240px',
  '--spacing-2xs': '4px',
  '--border-width-thin': '1px',
  '--color-border-base': 'rgb(228, 228, 232)',
  '--radius-surface-raised': '12px',
  '--color-surface-level-1': 'rgb(246, 246, 249)',
  '--color-text-primary': 'rgb(19, 19, 22)',
  '--shadow-surface-raised': 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px',
} as const;

const LAYER = /^@layer [\w-]+ \{(?<rules>[\s\S]*)\}\s*$/u;

/** happy-dom applies no rule inside a cascade layer, so the stylesheet's rules are lifted out of it */
const applyStylesheet = async (url: URL): Promise<void> => {
  const css = await Bun.file(url).text();
  const style = document.createElement('style');
  const tokens = Object.entries(TOKEN_VALUES)
    .map(([name, token]) => `${name}: ${token};`)
    .join(' ');

  style.textContent = `:root { ${tokens} } ${LAYER.exec(css)?.groups?.['rules'] ?? css}`;
  document.head.append(style);
};

/** React hoists a stylesheet into the head, which outlives the tree that rendered it */
const removeStylesheets = (): void => {
  document.head.replaceChildren();
};

/** a custom property of the document's root, as the cascade gives it */
const rootPropertyOf = (property: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(property).trim();

export { applyStylesheet, removeStylesheets, rootPropertyOf, TOKEN_VALUES };
