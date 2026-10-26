import { Fact } from './fact.value-object';

/** A mark after a file's path that names the format its text is written in, whatever its name. */
enum FileFormat {
  /** JSON with comments, for a tool that reads them in a file named `.json` */
  Jsonc = 'jsonc',
}

/**
 * What decides whether an entry writes its file: a truth, or a fact that equals a text, `!` before
 * the fact for the opposite.
 */
interface Guard {
  /** the text, facts in it resolved, that the fact must equal; absent where the fact is a truth */
  readonly equals?: string;
  readonly fact: Fact;
  readonly isNegated: boolean;
}

/**
 * The file an entry writes, by its path from the unit's folder, as its key spells it:
 * `<path>[ !<format>][ ? <guard>]`, the guard `${<fact>}` or `${<fact>} = <text>`.
 */
interface TargetFile {
  readonly format?: FileFormat;
  readonly guard?: Guard;
  readonly path: string;
}

const GUARDED = /(.+?)\s+\?\s+(!?)(\$\{[^}]*\})(?:\s+=\s+(\S.*))?$/;
const FORMATTED = /(.+?)\s+!([a-z]+)$/;
const SEPARATOR = '/';
const PARENT = '..';
const formats: readonly FileFormat[] = Object.values(FileFormat);

// An unknown format's mark stays part of the path.
const pathOf = (text: string): Pick<TargetFile, 'format' | 'path'> => {
  const marked = FORMATTED.exec(text);

  if (marked === null) {
    return {
      path: text,
    };
  }

  const format = formats.find((known) => known === marked[2]);

  return format === undefined
    ? {
        path: text,
      }
    : {
        format,
        path: String(marked[1]),
      };
};

const of = (key: string): TargetFile => {
  const guarded = GUARDED.exec(key);

  if (guarded === null) {
    return pathOf(key);
  }

  const fact = Fact.wholeOf(String(guarded[3]));

  if (fact === undefined) {
    return pathOf(key);
  }

  const equals = guarded[4];

  return {
    ...pathOf(String(guarded[1])),
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

const staysInItsUnit = (file: TargetFile): boolean =>
  !(file.path.startsWith(SEPARATOR) || file.path.split(SEPARATOR).includes(PARENT));

// The target of the entries constitution runs, which no file is: a path names no fact but a role's.
const runPath = Fact.textOf(Fact.of('constitution.run'));

const isRun = (file: TargetFile): boolean => file.path === runPath;

const TargetFile = {
  isRun,
  of,
  runPath,
  staysInItsUnit,
} as const;

export type { Guard };
export { FileFormat, TargetFile };
