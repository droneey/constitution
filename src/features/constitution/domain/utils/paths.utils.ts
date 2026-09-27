const SEPARATOR = '/';
const CURRENT = '.';
const PARENT = '..';

const directoryOf = (path: string): string => {
  const end = path.lastIndexOf(SEPARATOR);

  return end === -1 ? CURRENT : path.slice(0, end);
};

const fileNameOf = (path: string): string =>
  path.slice(path.lastIndexOf(SEPARATOR) + 1);

const stemOf = (input: { extension: string; path: string }): string => {
  const name = fileNameOf(input.path);

  return name.endsWith(input.extension)
    ? name.slice(0, -input.extension.length)
    : name;
};

const normalizePath = (path: string): string => {
  const segments: string[] = [];

  for (const segment of path.split(SEPARATOR)) {
    if (
      segment === PARENT &&
      segments.length > 0 &&
      segments.at(-1) !== PARENT
    ) {
      segments.pop();
    } else if (segment !== '' && segment !== CURRENT) {
      segments.push(segment);
    }
  }

  const body = segments.join(SEPARATOR);

  if (body === '') {
    return CURRENT;
  }

  return path.endsWith(SEPARATOR) ? `${body}${SEPARATOR}` : body;
};

const joinPaths = (paths: readonly string[]): string =>
  normalizePath(paths.join(SEPARATOR));

export { directoryOf, fileNameOf, joinPaths, normalizePath, stemOf };
