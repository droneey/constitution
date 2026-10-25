const ROOT = '/';

interface JoinPathInput {
  readonly folder: string;
  readonly name: string;
}

const joinPath = (input: JoinPathInput): string =>
  input.folder === ROOT ? `${ROOT}${input.name}` : `${input.folder}/${input.name}`;

export { joinPath, ROOT };
