import { parseDocument } from 'yaml';

import { attempted, isSyntaxError } from '#/kernel/utils';

import type { ConfigurationParser, Setting } from '../../domain/contracts';
import { settingModel } from './models';

const EXTENSION = '.';

// A YAML text's settings, or undefined when it holds an error.
const parseYaml = (text: string): unknown => {
  const document = parseDocument(text);

  return document.errors.length > 0 ? undefined : document.toJS();
};

// The parse of each format by its extension; JSON's own files may hold comments, as Biome's do.
const parsers: Readonly<Record<string, (text: string) => unknown>> = {
  json: Bun.JSONC.parse,
  jsonc: Bun.JSONC.parse,
  toml: Bun.TOML.parse,
  yaml: parseYaml,
  yml: parseYaml,
};

// A null leaves its table or list, as internal code spells no absence by it.
const withoutNull = (_key: string, held: unknown): unknown => {
  if (Array.isArray(held)) {
    return held.filter((entry) => entry !== null);
  }

  return held === null ? undefined : held;
};

// Written to JSON and back, a TOML date becomes its text, and a text that holds nothing fails.
const parse = (input: { path: string; text: string }): Setting | undefined => {
  const extension = input.path.slice(input.path.lastIndexOf(EXTENSION) + 1);
  const read = Object.entries(parsers).find(([name]) => name === extension)?.[1];

  if (read === undefined) {
    return undefined;
  }

  const parsed = settingModel.safeParse(
    attempted<unknown>({
      effect: () => JSON.parse(JSON.stringify(read(input.text), withoutNull)),
      isRecognised: isSyntaxError,
    }),
  );

  return parsed.success ? parsed.data : undefined;
};

const createConfigurationParser = (): ConfigurationParser => ({
  parse,
});

export { createConfigurationParser };
