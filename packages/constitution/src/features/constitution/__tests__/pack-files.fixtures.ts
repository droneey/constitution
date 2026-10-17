import type { Files } from './constitution.fixtures';
import { blockFiles, rule } from './constitution.fixtures';

const ACME = 'blocks/implementations/acme/acme.md';

// A pack of one implementation whose rule carries out a rule of the base's core.
const packFiles = (parent = 'dependencies-point-inward'): Files => ({
  ...blockFiles({
    body: `# Acme\n\n${rule({
      parent,
      slug: 'acme-called-inward',
    })}`,
    dir: 'blocks/implementations/acme',
    governs: [
      '**/acme.*',
    ],
    id: 'acme',
  }),
  'DECISIONS.md':
    '# Decision Log\n\n## ADR-0001 — Acme joins the pack\n**Date:** 2026-10-17 · **Status:** Accepted\n',
});

export { ACME, packFiles };
