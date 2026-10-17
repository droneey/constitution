import { parseDocument } from 'yaml';

import type { BindingsParser } from '../../domain/contracts';
import type { BindingsRead } from '../../domain/entities';
import { bindingsModel } from './models';

const parse = (yaml: string): BindingsRead => {
  const document = parseDocument(yaml, {
    prettyErrors: false,
  });
  const [error] = document.errors;

  if (error !== undefined) {
    return {
      reason: error.message,
      status: 'not-yaml',
    };
  }

  const parsing = bindingsModel.safeParse(document.toJS());

  return parsing.success
    ? {
        document: parsing.data,
        status: 'parsed',
      }
    : {
        issues: parsing.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
        status: 'mismatched',
      };
};

const createYamlBindingsParser = (): BindingsParser => ({
  parse,
});

export { createYamlBindingsParser };
