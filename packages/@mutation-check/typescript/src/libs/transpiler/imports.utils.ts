import { readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative } from 'node:path';

import { recognise } from '#/libs/errors';

const loadersByExtension: ReadonlyMap<string, Bun.JavaScriptLoader> = new Map([
  [
    '.ts',
    'ts',
  ],
  [
    '.tsx',
    // Stryker disable next-line StringLiteral: Bun's default loader reads markup as `tsx` does
    'tsx',
  ],
]);

const DEPENDENCY_FOLDER = '/node_modules/';
const PARENT_FOLDER = '..';

const loaderOf = (filePath: string): Bun.JavaScriptLoader | undefined =>
  loadersByExtension.get(extname(filePath));

const isResolveFailure = (caught: unknown): boolean => caught instanceof ResolveMessage;

interface ResolveInput {
  readonly folderPath: string;
  readonly specifier: string;
}

// An import Bun cannot resolve names no file there is, so it adds none.
const resolvedPathsOf = (input: ResolveInput): readonly string[] => {
  try {
    return [
      Bun.resolveSync(input.specifier, input.folderPath),
    ];
  } catch (error) {
    recognise({
      caught: error,
      isRecognised: isResolveFailure,
    });

    // Stryker disable next-line ArrayDeclaration: the caller keeps only absolute paths, which no added text is
    return [];
  }
};

interface ImportsInput {
  /** from the working folder */
  readonly filePath: string;
  readonly workingFolderPath: string;
}

/** The files of the working folder the file imports, by their paths from it. */
const importsOf = (input: ImportsInput): readonly string[] => {
  const loader = loaderOf(input.filePath);

  if (loader === undefined) {
    return [];
  }

  const absolutePath = join(input.workingFolderPath, input.filePath);
  // Stryker disable next-line StringLiteral: Bun's transpiler reads bytes as UTF-8 when no encoding is named
  const sourceText = readFileSync(absolutePath, 'utf8');

  return new Bun.Transpiler({
    loader,
  })
    .scanImports(sourceText)
    .flatMap(({ path: specifier }) =>
      resolvedPathsOf({
        folderPath: dirname(absolutePath),
        specifier,
      }),
    )
    .filter((targetPath) => isAbsolute(targetPath) && !targetPath.includes(DEPENDENCY_FOLDER))
    .map((targetPath) => relative(input.workingFolderPath, targetPath))
    .filter((targetPath) => !targetPath.startsWith(PARENT_FOLDER));
};

export { importsOf, loaderOf };
