import type { Finding } from '#/kernel';
import { Layer } from '#/kernel';

import type { Constitution } from '../../../entities';
import { BlockFileRole } from '../../../entities';
import { rewriteLocalLinks, targetFromRoot } from '../../../utils';

interface CorePart {
  findings: readonly Finding[];
  text: string;
}

const CORE_BUDGET = 3500;
const encoder = new TextEncoder();

const corePartOf = (constitution: Constitution): CorePart => {
  const core = constitution.blocks.find((block) => block.layer === Layer.Core);

  if (core === undefined) {
    return {
      findings: [],
      text: '',
    };
  }

  const body = rewriteLocalLinks({
    rewrite: (target: string): string =>
      targetFromRoot({
        path: core.path,
        target,
      }),
    text:
      // Stryker disable next-line OptionalChaining,ConditionalExpression,StringLiteral: a block's first file is its card
      core.files.find((file) => file.role === BlockFileRole.Main)?.body ?? '',
  });
  const text = `${body.trim()}\n`;
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
