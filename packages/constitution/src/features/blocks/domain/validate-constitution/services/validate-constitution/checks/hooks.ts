import type { FindingOf } from '#/kernel/types';

import { DocumentPath } from '../../../../constitution/entities';
import type { ManifestReadDetails } from '../../../../manifest/entities';
import { ManifestRead } from '../../../../manifest/entities';
import { ReadStatus } from '../../../../shared/entities';
import type { Check, CheckInput } from '../check.types';

enum HooksCode {
  FileMissing = 'hook-runs-missing-file',
}

interface HooksDetails {
  readonly [HooksCode.FileMissing]: {
    readonly file: string;
  };
}

type HooksFinding = FindingOf<HooksDetails & ManifestReadDetails>;

const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;

const missingFilesOf = (input: {
  commands: readonly string[];
  paths: ReadonlySet<string>;
}): readonly string[] =>
  input.commands
    .flatMap((command) => [
      ...command.matchAll(PLUGIN_FILE),
    ])
    .map(
      (match) =>
        // Stryker disable next-line StringLiteral: the group captures on every match
        match[1] ?? '',
    )
    .filter((file) => !input.paths.has(file));

const hooksCheck: Check<HooksFinding> = ({ constitution }: CheckInput): readonly HooksFinding[] => {
  const read = constitution.documents.hooks;

  if (read === undefined) {
    return [];
  }

  return read.status === ReadStatus.Parsed
    ? missingFilesOf({
        commands: read.value.commands,
        paths: constitution.paths,
      }).map(
        (file): HooksFinding => ({
          code: HooksCode.FileMissing,
          details: {
            file,
          },
          path: DocumentPath.Hooks,
        }),
      )
    : ManifestRead.unreadFindings({
        path: DocumentPath.Hooks,
        read,
      });
};

export type { HooksDetails };
export { HooksCode, hooksCheck };
