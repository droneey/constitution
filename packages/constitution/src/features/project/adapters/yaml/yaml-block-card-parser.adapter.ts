import { parseDocument } from 'yaml';

import { attempted } from '#/kernel/utils';

import type { BlockCard, BlockCardParser } from '../../domain/contracts';
import { EMPTY_CARD } from '../../domain/contracts';
import { blockCardModel } from './models';

const isReferenceError = (error: unknown): error is ReferenceError =>
  error instanceof ReferenceError;

const card = (yaml: string): BlockCard => {
  // Stryker disable next-line ObjectLiteral: YAML 1.2 reads by the core schema where none is named
  const document = parseDocument(yaml, {
    // Stryker disable next-line StringLiteral: an empty schema name names none, and YAML 1.2 then reads by the core schema
    schema: 'core',
  });
  const written =
    document.errors.length === 0
      ? attempted({
          effect: (): unknown =>
            document.toJS({
              maxAliasCount: 0,
            }),
          isRecognised: isReferenceError,
        })
      : undefined;
  const read = blockCardModel.safeParse(written);

  return read.success ? read.data : EMPTY_CARD;
};

const createYamlBlockCardParser = (): BlockCardParser => ({
  card,
});

export { createYamlBlockCardParser };
