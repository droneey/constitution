const ROOT = '/';

const joinPath = (input: { folder: string; name: string }): string =>
  input.folder === ROOT ? `${ROOT}${input.name}` : `${input.folder}/${input.name}`;

export { joinPath, ROOT };
