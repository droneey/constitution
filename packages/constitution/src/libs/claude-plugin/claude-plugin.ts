import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative, resolve, sep } from 'node:path';

import { isSystemError } from '#/libs/system-error';

// Why: a Claude Code plugin's own files are its manifest's folder, every path its manifest names,
// and the folders and files Claude Code reads a part from when the manifest names none.
const MANIFEST_FOLDER_NAME = '.claude-plugin';
const manifestFilePath = `${MANIFEST_FOLDER_NAME}${posix.sep}plugin.json`;
const DEFAULT_PLACES: readonly string[] = [
  'agents',
  'commands',
  'hooks',
  'output-styles',
  'skills',
  '.lsp.json',
  '.mcp.json',
] as const;
const MAX_FILES = 2000;
const PARENT = '..';

const manifestTextsOf = (root: string): readonly string[] =>
  // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
  Object.values(new Object(JSON.parse(readFileSync(join(root, manifestFilePath), 'utf8'))))
    .flat()
    .filter((fieldText): fieldText is string => typeof fieldText === 'string');

const pathFromRootOf = (input: { place: string; root: string }): string =>
  relative(input.root, resolve(input.root, input.place));

const isInside = (path: string): boolean => path !== '' && !path.startsWith(PARENT);

const filesAt = (input: { place: string; root: string }): readonly string[] => {
  const full = join(input.root, input.place);
  const stat = statSync(full, {
    throwIfNoEntry: false,
  });

  if (stat?.isFile() === true) {
    return [
      input.place,
    ];
  }

  return stat?.isDirectory() === true
    ? readdirSync(full, {
        recursive: true,
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile())
        .map((entry) => relative(input.root, join(entry.parentPath, entry.name)))
    : [];
};

const fingerprintOf = (root: string): string | undefined => {
  const places = new Set(
    [
      MANIFEST_FOLDER_NAME,
      ...DEFAULT_PLACES,
      ...manifestTextsOf(root),
    ]
      .map((place) =>
        pathFromRootOf({
          place,
          root,
        }),
      )
      .filter(isInside),
  );
  // biome-ignore lint/suspicious/useArraySortCompare: paths in UTF-16 order, the default, are the order every copy shares
  const files = [
    ...new Set(
      [
        ...places,
      ].flatMap((place) =>
        filesAt({
          place,
          root,
        }),
      ),
    ),
  ].toSorted();

  if (files.length > MAX_FILES) {
    return undefined;
  }

  const hash = createHash('sha256');

  for (const file of files) {
    const bytes = readFileSync(join(root, file));

    // Stryker disable next-line StringLiteral,MethodExpression: on POSIX a path already joins by "/"; Windows' backslashes are what this turns
    hash.update(`${file.split(sep).join(posix.sep)}\0${String(bytes.length)}\0`);
    hash.update(bytes);
  }

  return hash.digest('hex');
};

const isUnreadable = (error: unknown): boolean =>
  error instanceof SyntaxError || isSystemError(error);

const pluginFingerprintOf = (root: string): string | undefined => {
  try {
    return fingerprintOf(root);
  } catch (error) {
    if (isUnreadable(error)) {
      return undefined;
    }

    throw error;
  }
};

export { pluginFingerprintOf };
