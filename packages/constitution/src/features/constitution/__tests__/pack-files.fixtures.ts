import type { Files } from './constitution.fixtures';
import { blockFiles, chapterFile, rule } from './constitution.fixtures';

/** the file that holds acme's rule, a chapter of foundation */
const ACME = 'blocks/implementations/acme/foundation/calls.md';

// A pack of one implementation whose rule carries out a rule of the base's core.
const packFiles = (parent = 'dependencies-point-inward'): Files => ({
  ...blockFiles({
    body: '# Acme\n',
    dir: 'blocks/implementations/acme',
    files: {
      'calls.md': chapterFile(
        'Calls',
        rule({
          parent,
          slug: 'acme-called-inward',
        }),
      ),
    },
    governs: [
      '**/acme.*',
    ],
    id: 'acme',
  }),
  'DECISIONS.md':
    '# Decision Log\n\n## ADR-0001 — Acme joins the pack\n**Date:** 2026-10-17 · **Status:** Accepted\n',
});

export { ACME, packFiles };
