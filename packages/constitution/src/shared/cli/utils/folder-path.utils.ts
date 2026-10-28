import { AbsolutePath } from '#/kernel/value-objects';

interface FolderPathInput {
  /** the folder a path that does not open with "/" is read from */
  readonly from: AbsolutePath;
  /** the folder as the command is given it */
  readonly given: string;
}

/** The folder a command is given, from the folder it is read from unless it opens with "/". */
const folderPathOf = (input: FolderPathInput): AbsolutePath =>
  AbsolutePath.is(input.given) ? input.given : AbsolutePath.join(input.from, input.given);

export { folderPathOf };
