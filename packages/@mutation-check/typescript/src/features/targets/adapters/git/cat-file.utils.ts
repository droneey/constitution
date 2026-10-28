import type { UnitRelativePath } from '#/kernel/value-objects';

import type { RepositoryRelativePath } from './models';

const NEWLINE_BYTE = 0x0a;

// `cat-file --batch` answers a name with `<id> <type> <size>` and the object's bytes, or with the name
// and why it has no object, such as `missing` for a file the main line never had.
const OBJECT_HEADER_PATTERN = /^[\da-f]+ \S+ (\d+)/;

interface CatFileRequestInput {
  readonly baseCommit: string;
  readonly filePaths: readonly UnitRelativePath[];
  readonly movedFromPaths: ReadonlyMap<UnitRelativePath, RepositoryRelativePath>;
}

interface BaseTextsInput {
  readonly answer: Buffer;
  readonly filePaths: readonly UnitRelativePath[];
}

/** A moved file is named by its path from the repository's folder, any other from the unit's by `./`. */
const catFileRequestOf = (input: CatFileRequestInput): string =>
  input.filePaths
    .map((filePath) => {
      const movedFromPath = input.movedFromPaths.get(filePath);

      return movedFromPath === undefined
        ? `${input.baseCommit}:./${filePath}\n`
        : `${input.baseCommit}:${movedFromPath}\n`;
    })
    .join('');

// The answer is read as bytes, since a size counts bytes and a text may hold several to a character.
const baseTextsIn = (input: BaseTextsInput): ReadonlyMap<UnitRelativePath, string> => {
  let headerStartByte = 0;

  return new Map(
    input.filePaths.flatMap((filePath) => {
      const headerEndByte = input.answer.indexOf(NEWLINE_BYTE, headerStartByte);
      const sizeBytesText = input.answer
        .toString('utf8', headerStartByte, headerEndByte)
        .match(OBJECT_HEADER_PATTERN)?.[1];
      const textStartByte = headerEndByte + 1;

      if (sizeBytesText === undefined) {
        headerStartByte = textStartByte;

        return [];
      }

      const textEndByte = textStartByte + Number(sizeBytesText);

      // the object's bytes end in a newline of their own
      headerStartByte = textEndByte + 1;

      return [
        [
          filePath,
          input.answer.toString('utf8', textStartByte, textEndByte),
        ] as const,
      ];
    }),
  );
};

export { baseTextsIn, catFileRequestOf };
