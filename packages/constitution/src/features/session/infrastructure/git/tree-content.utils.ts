import { createHash } from 'node:crypto';

enum HashName {
  Sha1 = 'sha1',
  Sha256 = 'sha256',
}

enum GitFileMode {
  Regular = '100644',
  Executable = '100755',
  Link = '120000',
}

enum WorkContentKind {
  Gone = 'gone',
  Read = 'read',
}

type WorkContent =
  | {
      readonly kind: WorkContentKind.Gone;
    }
  | {
      readonly bytes: Uint8Array;
      readonly kind: WorkContentKind.Read;
      readonly mode: GitFileMode;
    };

interface WorkFile {
  readonly content: WorkContent;
  readonly path: string;
}

interface TreeContentInput {
  readonly hashName: HashName;
  readonly indexListing: Uint8Array;
  readonly workFiles: readonly WorkFile[];
}

const ENTRY_SEPARATOR = '\0';
const FIELDS_END = '\t';
const BLOB_TYPE = 'blob';
const HEADER_END = '\0';
const FIELD_SEPARATOR = ' ';

// Why: ls-files -s ends each entry in a NUL as `<mode> <object> <stage>\t<path>`; an unmerged path
// holds an entry per stage, which its content in the work tree replaces.
const indexEntriesOf = (listing: Uint8Array): Map<string, string> =>
  new Map(
    new TextDecoder()
      .decode(listing)
      .split(ENTRY_SEPARATOR)
      .filter((entry) => entry !== '')
      .map((entry) => {
        const tab = entry.indexOf(FIELDS_END);
        const fields = entry.slice(0, tab);

        return [
          entry.slice(tab + 1),
          fields.slice(0, fields.lastIndexOf(FIELD_SEPARATOR)),
        ];
      }),
  );

// Why: git names a file's content by the hash of a blob's header and its bytes, so a work file
// read here takes the name a commit of it gives.
const blobNameOf = (input: { bytes: Uint8Array; hashName: HashName }): string =>
  createHash(input.hashName)
    .update(`${BLOB_TYPE}${FIELD_SEPARATOR}${input.bytes.length}${HEADER_END}`)
    .update(input.bytes)
    .digest('hex');

// Stryker disable next-line EqualityOperator: no two lines are equal, each holding its own path
const byCodeUnits = (left: string, right: string): -1 | 1 => (left < right ? -1 : 1);

// Why: the content of every file, the index's where the work tree holds it unchanged, names the
// tree, so a commit that keeps the content keeps the fingerprint, and any change of a file, its
// mode or its presence gives another.
const treeContentFingerprintOf = (input: TreeContentInput): string => {
  const entries = indexEntriesOf(input.indexListing);

  for (const file of input.workFiles) {
    const { content } = file;

    if (content.kind === WorkContentKind.Gone) {
      entries.delete(file.path);

      continue;
    }

    entries.set(
      file.path,
      `${content.mode}${FIELD_SEPARATOR}${blobNameOf({
        bytes: content.bytes,
        hashName: input.hashName,
      })}`,
    );
  }

  // Why: a path holds no NUL, so the lines sort by their paths, in the order of their code units.
  return createHash('sha256')
    .update(
      [
        ...entries,
      ]
        .map(([path, entry]) => `${path}${ENTRY_SEPARATOR}${entry}${ENTRY_SEPARATOR}`)
        .toSorted(byCodeUnits)
        .join(''),
    )
    .digest('hex');
};

export type { WorkContent };
export { GitFileMode, HashName, treeContentFingerprintOf, WorkContentKind };
