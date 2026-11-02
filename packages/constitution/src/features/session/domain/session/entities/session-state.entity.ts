import type { ConfigReadStatus, MustRule } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { GoverningBlock } from './active-blocks.entity';

interface KeptBlock extends GoverningBlock {
  readonly files: readonly string[];
}

type SessionState =
  | {
      readonly repositoryFolderPath: AbsolutePath;
      readonly status: ConfigReadStatus.Unparsed;
    }
  | {
      readonly active: readonly KeptBlock[];
      readonly mustsBesideCore: readonly MustRule[];
      readonly repositoryFolderPath: AbsolutePath;
      readonly status: ConfigReadStatus.Parsed;
    };

type ParsedState = Extract<
  SessionState,
  {
    readonly status: ConfigReadStatus.Parsed;
  }
>;

export type { KeptBlock, ParsedState, SessionState };
