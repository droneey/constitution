import { parseDocument } from 'yaml';

import type { BindingsParser } from '../../domain/contracts';
import type { BindingsRead } from '../../domain/entities';
import { ReadStatus } from '../../domain/entities';
import { bindingsModel } from './models';

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

  const parsing = bindingsModel.safeParse(document.toJS());

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
