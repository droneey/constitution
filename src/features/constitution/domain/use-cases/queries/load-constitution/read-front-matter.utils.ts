import { parse } from 'yaml';

import type { Finding } from '#/kernel';
import { splitFrontMatter } from '#/libs/markdown';

import type { FrontMatter } from '../../../entities';
import { FRONT_MATTER_FIELDS, frontMatterSchema } from './front-matter.schema';

interface FrontMatterRead {
  body: string;
  findings: readonly Finding[];
  frontMatter?: FrontMatter;
}

type YamlResult =
  | {
      isParsed: true;
      value: unknown;
    }
  | {
      error: string;
      isParsed: false;
    };

const FIELDS: readonly string[] = FRONT_MATTER_FIELDS;
const FIELD_ORDER = FIELDS.join(', ');

const firstLine = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).split('\n')[0] ?? '';

const parseYaml = (text: string): YamlResult => {
  try {
    return {
      isParsed: true,
      value: parse(text),
    };
  } catch (error) {
    return {
      error: firstLine(error),
      isParsed: false,
    };
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const keyFindings = (input: {
  keys: readonly string[];
  path: string;
}): readonly Finding[] => {
  const missing = FIELDS.filter((field) => !input.keys.includes(field)).map(
    (field) => ({
      message: `front matter lacks "${field}"; every block declares every field`,
      path: input.path,
    }),
  );
  const unknown = input.keys
    .filter((key) => !FIELDS.includes(key))
    .map((key) => ({
      message: `front matter has "${key}", which is not a field`,
      path: input.path,
    }));

  if (missing.length > 0 || unknown.length > 0) {
    return [
      ...missing,
      ...unknown,
    ];
  }

  return input.keys.join(', ') === FIELD_ORDER
    ? []
    : [
        {
          message: `front matter lists its fields out of order; the order is ${FIELD_ORDER}`,
          path: input.path,
        },
      ];
};

const readFrontMatter = (input: {
  path: string;
  text: string;
}): FrontMatterRead => {
  const document = splitFrontMatter(input.text);
  const failed = (findings: readonly Finding[]): FrontMatterRead => ({
    body: document.body,
    findings,
  });

  if (document.frontMatter === undefined) {
    return failed([
      {
        message: 'has no front matter; a main file opens with it',
        path: input.path,
      },
    ]);
  }

  const yaml = parseYaml(document.frontMatter);

  if (!yaml.isParsed) {
    return failed([
      {
        message: `front matter is not valid YAML: ${yaml.error}`,
        path: input.path,
      },
    ]);
  }

  if (!isRecord(yaml.value)) {
    return failed([
      {
        message: 'front matter is not a mapping of fields',
        path: input.path,
      },
    ]);
  }

  const keys = keyFindings({
    keys: Object.keys(yaml.value),
    path: input.path,
  });

  if (keys.length > 0) {
    return failed(keys);
  }

  const result = frontMatterSchema.safeParse(yaml.value);

  if (!result.success) {
    return failed(
      result.error.issues.map((issue) => ({
        message: `front matter: ${issue.path.join('.')}: ${issue.message}`,
        path: input.path,
      })),
    );
  }

  return {
    body: document.body,
    findings: [],
    frontMatter: result.data,
  };
};

export { readFrontMatter };
