import { PARENT_SEGMENT, PATH_SEPARATOR } from '#/kernel/constants';

import { Fact } from './fact.value-object';

enum FileFormat {
  Jsonc = 'jsonc',
}

interface Guard {
  readonly equals?: string;
  readonly fact: Fact;
  readonly isNegated: boolean;
}

enum TargetKind {
  File = 'file',
  Run = 'run',
}

interface TargetFile {
  readonly format?: FileFormat;
  readonly guard?: Guard;
  readonly kind: TargetKind.File;
  readonly writtenPath: string;
}

interface TargetRun {
  readonly guard?: Guard;
  readonly kind: TargetKind.Run;
}

type EntryTarget = TargetFile | TargetRun;

const GUARDED = /(.+?)\s+\?\s+(!?)(\$\{[^}]*\})(?:\s+=\s+(\S.*))?$/;
const FORMATTED = /(.+?)\s+!([a-z]+)$/;
const formats: readonly FileFormat[] = Object.values(FileFormat);
// Why: spelled through its fact, as the linter refuses `${` in a plain string.
const runTargetKey = Fact.textOf(Fact.of('constitution.run'));

const targetFileOf = (text: string): TargetFile => {
  const marked = FORMATTED.exec(text);

  if (marked === null) {
    return {
      kind: TargetKind.File,
      writtenPath: text,
    };
  }

  const format = formats.find((known) => known === marked[2]);

  return format === undefined
    ? {
        kind: TargetKind.File,
        writtenPath: text,
      }
    : {
        format,
        kind: TargetKind.File,
        writtenPath: String(marked[1]),
      };
};

const unguardedOf = (text: string): EntryTarget =>
  text === runTargetKey
    ? {
        kind: TargetKind.Run,
      }
    : targetFileOf(text);

const of = (key: string): EntryTarget => {
  const guarded = GUARDED.exec(key);

  if (guarded === null) {
    return unguardedOf(key);
  }

  const fact = Fact.wholeOf(String(guarded[3]));

  if (fact === undefined) {
    return unguardedOf(key);
  }

  const equals = guarded[4];

  return {
    ...unguardedOf(String(guarded[1])),
    guard: {
      ...(equals === undefined
        ? {}
        : {
            equals,
          }),
      fact,
      isNegated: guarded[2] === '!',
    },
  };
};

const textOf = (target: EntryTarget): string => {
  switch (target.kind) {
    case TargetKind.File:
      return target.writtenPath;
    case TargetKind.Run:
      return runTargetKey;
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return target satisfies never;
  }
};

const staysInItsUnit = (file: TargetFile): boolean =>
  !(
    file.writtenPath.startsWith(PATH_SEPARATOR) ||
    file.writtenPath.split(PATH_SEPARATOR).includes(PARENT_SEGMENT)
  );

const EntryTarget = {
  of,
  staysInItsUnit,
  textOf,
} as const;

export type { Guard, TargetFile, TargetRun };
export { EntryTarget, FileFormat, TargetKind };
