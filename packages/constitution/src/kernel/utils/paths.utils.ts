const SEPARATOR = '/';
const CURRENT = '.';
const PARENT = '..';
const DOT_SLASH = './';

const directoryOf = (path: string): string => {
  const end = path.lastIndexOf(SEPARATOR);

  return end === -1 ? CURRENT : path.slice(0, end);
};

const fileNameOf = (path: string): string => path.slice(path.lastIndexOf(SEPARATOR) + 1);

interface StemInput {
  readonly extension: string;
  readonly path: string;
}

const stemOf = (input: StemInput): string => {
  const name = fileNameOf(input.path);

  return name.endsWith(input.extension) ? name.slice(0, -input.extension.length) : name;
};

const normalizePath = (path: string): string => {
  const segments: string[] = [];

  for (const segment of path.split(SEPARATOR)) {
    if (segment === PARENT && segments.length > 0 && segments.at(-1) !== PARENT) {
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

const withoutDotSlash = (path: string): string =>
  path.startsWith(DOT_SLASH) ? path.slice(DOT_SLASH.length) : path;

const joinPaths = (paths: readonly string[]): string => normalizePath(paths.join(SEPARATOR));

/** Whether a candidate is one segment of a path: text, not empty, without a "/". */
const isPathSegment = (candidate: unknown): candidate is string =>
  typeof candidate === 'string' && candidate !== '' && !candidate.includes(SEPARATOR);

export { directoryOf, isPathSegment, joinPaths, normalizePath, stemOf, withoutDotSlash };
