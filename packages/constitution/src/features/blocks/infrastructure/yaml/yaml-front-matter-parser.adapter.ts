import type { Document } from 'yaml';
import { isAlias, LineCounter, parseDocument, visit } from 'yaml';

import type { FrontMatterParser } from '../../application/contracts';
import type { FrontMatterRead, SkillFrontMatterRead } from '../../domain/entities';
import { ReadStatus } from '../../domain/entities';
import { frontMatterModel, skillFrontMatterModel } from './models';

const ALIAS_REASON = 'an unquoted value starts with "*", which YAML reads as an alias; quote it';
const TOP_LEVEL_KEY = /^([A-Za-z_][\w-]*)\s*:/;

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

const placeOf = (input: {
  line: number;
  yaml: string;
}): {
  key?: string;
  line: number;
} => {
  const key = input.yaml
    .split('\n')
    .slice(0, input.line)
    .toReversed()
    .map((text) => TOP_LEVEL_KEY.exec(text)?.[1])
    .find((found) => found !== undefined);

  return key === undefined
    ? {
        line: input.line,
      }
    : {
        key,
        line: input.line,
      };
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

// Why: an alias counts as no YAML, so no value is expanded from its anchor.
const writtenOf = (
  yaml: string,
):
  | {
      readonly at: {
        readonly key?: string;
        readonly line: number;
      };
      readonly reason: string;
      readonly status: ReadStatus.NotYaml;
    }
  | {
      readonly status: ReadStatus.Parsed;
      readonly written: unknown;
    } => {
  const lineCounter = new LineCounter();
  const document = parseDocument(yaml, {
    lineCounter,
    prettyErrors: false,
    // Stryker disable next-line StringLiteral: YAML 1.2 reads by the core schema where none is named
    schema: 'core',
  });
  const [error] = document.errors;

  if (error !== undefined) {
    return {
      at: placeOf({
        line: lineCounter.linePos(error.pos[0]).line,
        yaml,
      }),
      reason: error.message,
      status: ReadStatus.NotYaml,
    };
  }

  const offset = aliasOffset(document);

  if (offset !== undefined) {
    return {
      at: placeOf({
        line: lineCounter.linePos(offset).line,
        yaml,
      }),
      reason: ALIAS_REASON,
      status: ReadStatus.NotYaml,
    };
  }

  return {
    status: ReadStatus.Parsed,
    // Stryker disable next-line ObjectLiteral: every alias is refused above, so the bound only states it
    written: document.toJS({
      maxAliasCount: 0,
    }),
  };
};

const parse = (yaml: string): FrontMatterRead => {
  const read = writtenOf(yaml);

  if (read.status === ReadStatus.NotYaml) {
    return read;
  }

  return isMapping(read.written)
    ? mappingOf(read.written)
    : {
        status: ReadStatus.NotMapping,
      };
};

const skill = (yaml: string): SkillFrontMatterRead => {
  const read = writtenOf(yaml);

  if (read.status === ReadStatus.NotYaml) {
    return {
      reason: read.reason,
      status: ReadStatus.NotYaml,
    };
  }

  const parsing = skillFrontMatterModel.safeParse(read.written);
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
