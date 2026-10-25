import { parseDocument } from 'yaml';

import { attempted } from '#/kernel/utils';

import type { BindingsParser } from '../../domain/contracts';
import type { BindingsRead } from '../../domain/entities';
import { ReadStatus } from '../../domain/entities';
import { bindingsModel } from './models';

const UNRESOLVED_ALIAS = 'an alias names an anchor the file does not set before it';

const isReferenceError = (error: unknown): boolean => error instanceof ReferenceError;

const parse = (yaml: string): BindingsRead => {
  const document = parseDocument(yaml, {
    prettyErrors: false,
  });
  const [error] = document.errors;

  if (error !== undefined) {
    return {
      reason: error.message,
      status: ReadStatus.NotYaml,
    };
  }

  // An alias without its anchor parses without an error and throws only as it resolves.
  const parsed: unknown = attempted({
    effect: (): unknown => document.toJS(),
    isRecognised: isReferenceError,
  });

  if (parsed === undefined) {
    return {
      reason: UNRESOLVED_ALIAS,
      status: ReadStatus.NotYaml,
    };
  }

  const parsing = bindingsModel.safeParse(parsed);

  return parsing.success
    ? {
        document: parsing.data,
        status: ReadStatus.Parsed,
      }
    : {
        issues: parsing.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
        status: ReadStatus.Mismatched,
      };
};

const createYamlBindingsParser = (): BindingsParser => ({
  parse,
});

export { createYamlBindingsParser };
