import { posix } from 'node:path';

import type { Finding } from '#/kernel';
import { rewriteLocalLinks } from '#/libs/markdown';

import type { Constitution } from '../../../entities';
import { targetFromRoot } from '../../../utils';

interface CorePart {
  findings: readonly Finding[];
  text: string;
}

const CORE_BUDGET = 3500;
const PRINCIPLES = 'principles.md';
const encoder = new TextEncoder();

// Core's part is core.md's own text and the titles of the laws, the MUST rules
// of the principles chapter; step 2 writes both to fit the budget.
const corePartOf = (constitution: Constitution): CorePart => {
  const core = constitution.blocks.find((block) => block.layer === 'core');

  if (core === undefined) {
    return {
      findings: [],
      text: '',
    };
  }

  const folder = posix.dirname(core.path);
  const principles = posix.join(folder, PRINCIPLES);
  const laws = constitution.rules
    .filter((rule) => rule.file === principles && rule.level === 'MUST')
    .map((rule) => rule.slug);
  const body = rewriteLocalLinks({
    rewrite: (target: string): string =>
      targetFromRoot({
        path: core.path,
        target,
      }),
    text: core.files.find((file) => file.role === 'main')?.body ?? '',
  });
  const text = `${[
    body.trim(),
    ...(laws.length === 0
      ? []
      : [
          `Laws: ${laws.join(', ')}.`,
        ]),
  ]
    .filter((part) => part !== '')
    .join('\n\n')}\n`;
  const bytes = encoder.encode(text).length;

  return {
    findings:
      bytes > CORE_BUDGET
        ? [
            {
              message: `makes a core part of ${bytes} bytes; the digest holds at most ${CORE_BUDGET} of core`,
              path: core.path,
            },
          ]
        : [],
    text,
  };
};

export { corePartOf };
