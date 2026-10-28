import { AbsolutePath } from '#/kernel/value-objects';

interface FolderPathInput {
  readonly from: AbsolutePath;
  readonly given: string;
}

const folderPathOf = (input: FolderPathInput): AbsolutePath =>
  AbsolutePath.is(input.given) ? input.given : AbsolutePath.join(input.from, input.given);

export { folderPathOf };
