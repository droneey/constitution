import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative, resolve, sep } from 'node:path';

import { isSystemError } from '#/libs/system-error';

// A Claude Code plugin's own files: its manifest's folder, every path its manifest names, and the
// folders and files Claude Code reads a part from when the manifest names none.
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
// A plugin of more files than this is no glue the fingerprint is meant for.
const MAX_FILES = 2000;
const PARENT = '..';

// The texts a manifest gives its fields, a list's items among them; one that names no file of the
// plugin adds nothing.
const namedOf = (root: string): readonly string[] =>
  // Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well; the rule asks that it be named
  Object.values(new Object(JSON.parse(readFileSync(join(root, manifestFilePath), 'utf8'))))
    .flat()
    .filter((value): value is string => typeof value === 'string');

const placeOf = (input: { place: string; root: string }): string =>
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
      ...namedOf(root),
    ]
      .map((place) =>
        placeOf({
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

// What a call of the system or a manifest that is no JSON fails with; any other failure, a path the
// system refuses to take among them, is a defect.
const isUnreadable = (error: unknown): boolean =>
  error instanceof SyntaxError || isSystemError(error);

/**
 * A content hash of the plugin's own files below root, the same for any copy of them; undefined
 * when root holds no readable manifest, a file of the plugin cannot be read, or it holds more files
 * than a plugin's glue.
 */
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
