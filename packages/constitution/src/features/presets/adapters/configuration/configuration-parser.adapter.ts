import { parseDocument } from 'yaml';

import { attempted, isSyntaxError } from '#/kernel/utils';

import type { ConfigurationParser, ConfigurationText, Setting } from '../../domain/contracts';
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

// Written to JSON and back, a TOML date becomes its text; a text that holds nothing, which JSON
// cannot write, holds no settings.
const plainOf = (held: unknown): unknown => {
  const json: string | undefined = JSON.stringify(held, withoutNull);

  return json === undefined ? undefined : JSON.parse(json);
};

const parse = (input: ConfigurationText): Setting | undefined => {
  const extension = input.path.slice(input.path.lastIndexOf(EXTENSION) + 1);
  const read = Object.entries(parsers).find(([name]) => name === extension)?.[1];

  if (read === undefined) {
    return undefined;
  }

  const held = attempted<unknown>({
    effect: () => read(input.text),
    isRecognised: isSyntaxError,
  });
  const parsed = settingModel.safeParse(plainOf(held));

  return parsed.success ? parsed.data : undefined;
};

const createConfigurationParser = (): ConfigurationParser => ({
  parse,
});

export { createConfigurationParser };
