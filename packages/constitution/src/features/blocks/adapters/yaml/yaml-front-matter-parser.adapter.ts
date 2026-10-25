import type { Document } from 'yaml';
import { isAlias, LineCounter, parseDocument, visit } from 'yaml';

import { attempted } from '#/kernel/utils';

import type { FrontMatterParser, FrontMatterRead } from '../../domain/contracts';
import type { SkillFrontMatterRead } from '../../domain/entities';
import { ReadStatus } from '../../domain/entities';
import { frontMatterModel, skillFrontMatterModel } from './models';

const ALIAS_REASON = 'an unquoted value starts with "*", which YAML reads as an alias; quote it';

const isReferenceError = (error: unknown): boolean => error instanceof ReferenceError;

const isMapping = (parsed: unknown): parsed is Record<string, unknown> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

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

const mappingOf = (mapping: Record<string, unknown>): FrontMatterRead => {
  const parsing = frontMatterModel.safeParse(mapping);
  const keys = Object.keys(mapping);

  return parsing.success
    ? {
        fields: parsing.data,
        keys,
        status: ReadStatus.Mapping,
      }
    : {
        issues: parsing.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
        keys,
        status: ReadStatus.Mismatched,
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
      status: ReadStatus.NotYaml,
    };
  }

  const offset = aliasOffset(document);

  if (offset !== undefined) {
    return {
      line: lineCounter.linePos(offset).line,
      reason: ALIAS_REASON,
      status: ReadStatus.NotYaml,
    };
  }

  const parsed: unknown = document.toJS();

  return isMapping(parsed)
    ? mappingOf(parsed)
    : {
        status: ReadStatus.NotMapping,
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
      reason: ALIAS_REASON,
      status: ReadStatus.NotYaml,
    };
  }

  const parsing = skillFrontMatterModel.safeParse(parsed);
  const { description, name } = parsing.success ? parsing.data : {};

  return {
    ...(description === undefined
      ? {}
      : {
          description,
        }),
    ...(name === undefined
      ? {}
      : {
          name,
        }),
    status: ReadStatus.Parsed,
  };
};

const createYamlFrontMatterParser = (): FrontMatterParser => ({
  parse,
  skill,
});

export { createYamlFrontMatterParser };
