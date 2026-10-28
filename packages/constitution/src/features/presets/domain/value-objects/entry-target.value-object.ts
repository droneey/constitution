import { PARENT_SEGMENT, PATH_SEPARATOR } from '#/kernel/constants';

import { Fact } from './fact.value-object';

/** A mark after a file's path that names the format its text is written in, whatever its name. */
enum FileFormat {
  /** JSON with comments, for a tool that reads them in a file named `.json` */
  Jsonc = 'jsonc',
}

/**
 * What decides whether an entry writes its target: a truth, or a fact that equals a text, `!`
 * before the fact for the opposite.
 */
interface Guard {
  /** the text, facts in it resolved, that the fact must equal; absent where the fact is a truth */
  readonly equals?: string;
  readonly fact: Fact;
  readonly isNegated: boolean;
}

enum TargetKind {
  File = 'file',
  /** the commands constitution runs in the unit for each entry point, which no file holds */
  Run = 'run',
}

/** A configuration file, as its key spells it: `<path>[ !<format>]`. */
interface TargetFile {
  readonly format?: FileFormat;
  readonly guard?: Guard;
  readonly kind: TargetKind.File;
  /** from the unit's folder, facts in it unresolved; it may lead out of the folder */
  readonly writtenPath: string;
}

interface TargetRun {
  readonly guard?: Guard;
  readonly kind: TargetKind.Run;
}

/**
 * What an entry writes, as its key spells it: `<file>` or `${constitution.run}`, then `[ ? <guard>]`,
 * the guard `${<fact>}` or `${<fact>} = <text>`.
 */
type EntryTarget = TargetFile | TargetRun;

const GUARDED = /(.+?)\s+\?\s+(!?)(\$\{[^}]*\})(?:\s+=\s+(\S.*))?$/;
const FORMATTED = /(.+?)\s+!([a-z]+)$/;
const formats: readonly FileFormat[] = Object.values(FileFormat);
// Spelled through its fact, as the linter refuses `${` in a plain string.
const runKey = Fact.textOf(Fact.of('constitution.run'));

// An unknown format's mark stays part of the path.
const fileOf = (text: string): TargetFile => {
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
  text === runKey
    ? {
        kind: TargetKind.Run,
      }
    : fileOf(text);

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

/** The target as its key names it, its format and its guard left out: one text, one target. */
const textOf = (target: EntryTarget): string => {
  switch (target.kind) {
    case TargetKind.File:
      return target.writtenPath;
    case TargetKind.Run:
      return runKey;
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
