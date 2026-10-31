import { UnitRelativePath } from '#/kernel/value-objects';

import { RepositoryRelativePath } from './models';

enum SectionKind {
  Changed = 'changed',
  Moved = 'moved',
}

type UnitSection =
  | {
      readonly filePath: UnitRelativePath;
      readonly kind: SectionKind.Changed;
      readonly text: string;
    }
  | {
      readonly filePath: UnitRelativePath;
      readonly kind: SectionKind.Moved;
      readonly movedFromPath: RepositoryRelativePath;
      readonly text: string;
    };

interface UnitSectionsInput {
  readonly diff: string;
  readonly unitPrefix: string;
}

const BEFORE_FILE_HEADER_PATTERN = /(?=^diff --git )/m;
// Why: a moved file that keeps its text has no `+++` line, only the name it was moved to; git ends
// a name that holds a space with a tab.
const NEW_PATH_PATTERN = /^(?:\+\+\+ b\/|rename to )(.+?)\t?$/m;
const MOVED_FROM_PATH_PATTERN = /^rename from (.+)/m;

const sectionOf = (input: { filePath: UnitRelativePath; text: string }): UnitSection => {
  const movedFromPath = input.text.match(MOVED_FROM_PATH_PATTERN)?.[1];

  if (movedFromPath !== undefined) {
    return {
      ...input,
      kind: SectionKind.Moved,
      movedFromPath: RepositoryRelativePath.create(movedFromPath),
    };
  }

  return {
    ...input,
    kind: SectionKind.Changed,
  };
};

const unitSectionsOf = (input: UnitSectionsInput): readonly UnitSection[] =>
  input.diff.split(BEFORE_FILE_HEADER_PATTERN).flatMap((text) => {
    const newPath = text.match(NEW_PATH_PATTERN)?.[1];

    return newPath?.startsWith(input.unitPrefix) === true
      ? [
          sectionOf({
            filePath: UnitRelativePath.create(newPath.slice(input.unitPrefix.length)),
            text,
          }),
        ]
      : [];
  });

export type { UnitSection };
export { SectionKind, unitSectionsOf };
