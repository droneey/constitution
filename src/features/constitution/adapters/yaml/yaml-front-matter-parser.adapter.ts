import type { Document } from 'yaml';
import { isAlias, LineCounter, parseDocument, visit } from 'yaml';

import type {
  FrontMatterParser,
  FrontMatterRead,
} from '../../domain/contracts';
import { frontMatterModel } from './models';

const ALIAS_REASON =
  'an unquoted value starts with "*", which YAML reads as an alias; quote it';

const isMapping = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const aliasOffset = (document: Document): number | undefined => {
  let offset: number | undefined;

  visit(document, (_key: unknown, node: unknown): symbol | undefined => {
    if (!isAlias(node)) {
      return;
    }

    // Stryker disable next-line OptionalChaining: a parsed alias always has a range
    offset = node.range?.[0];

    return visit.BREAK;
  });

  return offset;
};

const mappingOf = (value: Record<string, unknown>): FrontMatterRead => {
  const result = frontMatterModel.safeParse(value);

  return {
    fields: result.success ? result.data : undefined,
    issues: result.success
      ? []
      : result.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
    keys: Object.keys(value),
    status: 'mapping',
  };
};

const parse = (yaml: string): FrontMatterRead => {
  const lineCounter = new LineCounter();
  const document = parseDocument(yaml, {
    lineCounter,
    prettyErrors: false,
  });
  const [error] = document.errors;

  if (error !== undefined) {
    return {
      line: lineCounter.linePos(error.pos[0]).line,
      reason: error.message,
      status: 'not-yaml',
    };
  }

  const offset = aliasOffset(document);

  if (offset !== undefined) {
    return {
      line: lineCounter.linePos(offset).line,
      reason: ALIAS_REASON,
      status: 'not-yaml',
    };
  }

  const value: unknown = document.toJS();

  return isMapping(value)
    ? mappingOf(value)
    : {
        status: 'not-a-mapping',
      };
};

const createYamlFrontMatterParser = (): FrontMatterParser => ({
  parse,
});

export { createYamlFrontMatterParser };
