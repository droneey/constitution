import type { Finding } from '#/kernel';
import { AXES, Layer, Level } from '#/kernel';

import type { Constitution } from '../../../entities';
import { BlockFileRole } from '../../../entities';
import {
  directoryOf,
  joinPaths,
  rewriteLocalLinks,
  targetFromRoot,
} from '../../../utils';

interface CorePart {
  findings: readonly Finding[];
  text: string;
}

const CORE_BUDGET = 3500;
const PRINCIPLES = 'principles.md';
const encoder = new TextEncoder();

const corePartOf = (constitution: Constitution): CorePart => {
  const core = constitution.blocks.find((block) => block.layer === Layer.Core);

  if (core === undefined) {
    return {
      findings: [],
      text: '',
    };
  }

  const folder = directoryOf(core.path);
  const laws = AXES.flatMap((axis) => {
    const principles = joinPaths([
      folder,
      axis,
      PRINCIPLES,
    ]);
    const slugs = constitution.rules
      .filter((rule) => rule.file === principles && rule.level === Level.Must)
      .map((rule) => rule.slug);

    return slugs.length === 0
      ? []
      : [
          `Laws of ${axis}: ${slugs.join(', ')}.`,
        ];
  });
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
  const text = `${[
    body.trim(),
    laws.join('\n'),
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
