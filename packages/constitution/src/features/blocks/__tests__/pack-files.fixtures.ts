import type { Files } from './constitution.fixtures';
import { blockFiles, chapterFile, rule } from './constitution.fixtures';

const ACME = 'blocks/implementations/acme/foundation/calls.md';

const packFiles = (parent = 'dependencies-point-inward'): Files => ({
  ...blockFiles({
    body: '# Acme\n',
    dir: 'blocks/implementations/acme',
    files: {
      'calls.md': chapterFile(
        'Calls',
        rule({
          tightens: parent,
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
