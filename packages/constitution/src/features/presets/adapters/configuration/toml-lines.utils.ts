import { parse, TomlError } from 'smol-toml';

import { attempted } from '#/kernel/utils';

import type { Setting } from '../../domain/entities';
import { settingOfWire } from './wire-setting.utils';

const HEADER = /^\s*\[\[?\s*([^\]]+?)\s*\]\]?\s*(?:#.*)?$/;
const HEADER_PART = /"[^"]*"|'[^']*'|[^.\s]+/g;
const QUOTES = /^["']|["']$/g;
const STRINGS = /"(?:[^"\\]|\\.)*"|'[^']*'/g;
const COMMENT = /#.*/;
const OPENERS = /[[{]/g;
const CLOSERS = /[\]}]/g;

const isTomlError = (error: unknown): boolean => error instanceof TomlError;

const readToml = (text: string): Setting | undefined =>
  settingOfWire(
    attempted({
      effect: () => parse(text),
      isRecognised: isTomlError,
    }),
  );

const unquotedOf = (key: string): string => key.replace(QUOTES, '');

const keysOfText = (text: string): readonly string[] =>
  // Stryker disable next-line ArrayDeclaration: a header or a key names at least one part
  (text.match(HEADER_PART) ?? []).map(unquotedOf);

const headerOf = (line: string): readonly string[] | undefined => {
  const match = HEADER.exec(line);

  return match === null ? undefined : keysOfText(String(match[1]));
};

/** How far a key's value runs: the brackets the line opens, strings and comments aside. */
const depthOf = (line: string): number => {
  // Stryker disable next-line StringLiteral: what stands for a string or a comment only has to hold no bracket
  const bare = line.replace(STRINGS, '').replace(COMMENT, '');

  return (bare.match(OPENERS)?.length ?? 0) - (bare.match(CLOSERS)?.length ?? 0);
};

export { depthOf, headerOf, keysOfText, readToml, STRINGS, unquotedOf };
