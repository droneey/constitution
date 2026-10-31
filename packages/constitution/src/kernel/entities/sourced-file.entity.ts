import type { SourceKind } from '../value-objects';

interface SourcedFile {
  readonly path: string;
  readonly source: SourceKind;
}

export type { SourcedFile };
