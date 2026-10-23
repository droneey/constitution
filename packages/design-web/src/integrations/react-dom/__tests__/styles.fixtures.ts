const TOKENS = {
  '--size-icon-md': '16px',
  '--stroke-icon': '2.25',
  '--size-popup-min': '240px',
  '--spacing-2xs': '4px',
  '--color-border-base': 'rgb(228, 228, 232)',
  '--radius-surface-raised': '12px',
  '--color-surface-level-1': 'rgb(246, 246, 249)',
  '--color-text-primary': 'rgb(19, 19, 22)',
  '--shadow-surface-raised': 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px',
};

const LAYER = /^@layer [\w-]+ \{(?<rules>[\s\S]*)\}\s*$/u;

/** happy-dom applies no rule inside a cascade layer, so the stylesheet's rules are lifted out of it */
const applyStylesheet = async (url: URL): Promise<void> => {
  const css = await Bun.file(url).text();
  const style = document.createElement('style');
  const tokens = Object.entries(TOKENS)
    .map(([name, token]) => `${name}: ${token};`)
    .join(' ');

  style.textContent = `:root { ${tokens} } ${LAYER.exec(css)?.groups?.['rules'] ?? css}`;
  document.head.append(style);
};

export { applyStylesheet, TOKENS };
