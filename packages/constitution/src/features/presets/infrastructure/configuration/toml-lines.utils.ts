import { parse, TomlError } from 'smol-toml';

import { attempted, fieldsOf } from '#/kernel/utils';

import type { Setting } from '../../domain/setting/entities';
import { settingOfWire } from './wire-setting.utils';

const HEADER = /^\s*\[\[?\s*([^\]]+?)\s*\]\]?\s*(?:#.*)?$/;
const QUOTES = /^["']|["']$/g;
const STRINGS = /"(?:[^"\\]|\\.)*"|'[^']*'/g;
const COMMENT = /#.*/;
const OPENERS = /[[{]/g;
const CLOSERS = /[\]}]/g;

const isTomlError = (error: unknown): error is TomlError => error instanceof TomlError;

const readToml = (text: string): Setting | undefined =>
  settingOfWire(
    attempted({
      effect: () => parse(text),
      isRecognised: isTomlError,
    }),
  );

const unquotedOf = (key: string): string => key.replace(QUOTES, '');

const keyPathOf = (wire: unknown): readonly string[] => {
  const [step] = fieldsOf(wire);

  return step === undefined
    ? []
    : [
        step[0],
        ...keyPathOf(step[1]),
      ];
};

const keysOfText = (text: string): readonly string[] =>
  keyPathOf(
    attempted({
      effect: () => parse(`${text} = 0`),
      isRecognised: isTomlError,
    }),
  );

const headerOf = (line: string): readonly string[] | undefined => {
  const match = HEADER.exec(line);

  return match === null ? undefined : keysOfText(String(match[1]));
};

const depthOf = (line: string): number => {
  // Stryker disable next-line StringLiteral: what stands for a string or a comment only has to hold no bracket
  const bare = line.replace(STRINGS, '').replace(COMMENT, '');

  return (bare.match(OPENERS)?.length ?? 0) - (bare.match(CLOSERS)?.length ?? 0);
};

export { depthOf, headerOf, keysOfText, readToml, STRINGS, unquotedOf };
