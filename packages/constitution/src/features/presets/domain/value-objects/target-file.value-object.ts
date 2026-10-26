import { Fact } from './fact.value-object';

/** The fact that decides whether an entry writes its file, `!` before it for its negation. */
interface Guard {
  readonly fact: Fact;
  readonly isNegated: boolean;
}

/**
 * The file an entry writes, by its path from the unit's folder, as its key spells it: `<path>`, or
 * `<path> ? ${<fact>}` when a guard decides whether the entry is taken.
 */
interface TargetFile {
  readonly guard?: Guard;
  readonly path: string;
}

const GUARDED = /(.+?)\s+\?\s+(!?)(\$\{[^}]*\})$/;
const SEPARATOR = '/';
const PARENT = '..';

const of = (key: string): TargetFile => {
  const guarded = GUARDED.exec(key);

  if (guarded === null) {
    return {
      path: key,
    };
  }

  const fact = Fact.wholeOf(String(guarded[3]));

  return fact === undefined
    ? {
        path: key,
      }
    : {
        guard: {
          fact,
          isNegated: guarded[2] === '!',
        },
        path: String(guarded[1]),
      };
};

const staysInItsUnit = (file: TargetFile): boolean =>
  !(file.path.startsWith(SEPARATOR) || file.path.split(SEPARATOR).includes(PARENT));

// The target of the entries the program runs, which no file is: a path names no fact but a role's.
const runPath = Fact.textOf(Fact.of('constitution.run'));

const isRun = (file: TargetFile): boolean => file.path === runPath;

const TargetFile = {
  isRun,
  of,
  runPath,
  staysInItsUnit,
} as const;

export type { Guard };
export { TargetFile };
