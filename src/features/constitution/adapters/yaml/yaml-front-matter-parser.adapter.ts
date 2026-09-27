import type { Document } from 'yaml';
import { isAlias, LineCounter, parseDocument, visit } from 'yaml';

import type {
  FrontMatterParser,
  FrontMatterRead,
} from '../../domain/contracts';
import type { SkillFrontMatterRead } from '../../domain/entities';
import { frontMatterModel, skillFrontMatterModel } from './models';

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
  const parsing = frontMatterModel.safeParse(value);

  return {
    fields: parsing.success ? parsing.data : undefined,
    issues: parsing.success
      ? []
      : parsing.error.issues.map((issue) => ({
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

// A value that is not a mapping, an empty front matter included, has neither
// field.
const skill = (yaml: string): SkillFrontMatterRead => {
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

  const parsing = skillFrontMatterModel.safeParse(document.toJS());

  return {
    description: parsing.success ? parsing.data.description : undefined,
    name: parsing.success ? parsing.data.name : undefined,
    status: 'parsed',
  };
};

const createYamlFrontMatterParser = (): FrontMatterParser => ({
  parse,
  skill,
});

export { createYamlFrontMatterParser };
