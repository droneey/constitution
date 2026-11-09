import { CURRENT_SEGMENT, PARENT_SEGMENT, PATH_SEPARATOR } from '../constants';

const DOT_SLASH = './';

const normalizePath = (path: string): string => {
  const segments: string[] = [];

  for (const segment of path.split(PATH_SEPARATOR)) {
    if (segment === PARENT_SEGMENT && segments.length > 0 && segments.at(-1) !== PARENT_SEGMENT) {
      segments.pop();
    } else if (segment !== '' && segment !== CURRENT_SEGMENT) {
      segments.push(segment);
    }
  }

  const body = segments.join(PATH_SEPARATOR);

  if (body === '') {
    return CURRENT_SEGMENT;
  }

  return path.endsWith(PATH_SEPARATOR) ? `${body}${PATH_SEPARATOR}` : body;
};

const isInnerPath = (path: string): boolean =>
  path === '' ||
  (normalizePath(path) === path &&
    path !== PARENT_SEGMENT &&
    !path.startsWith(`${PARENT_SEGMENT}${PATH_SEPARATOR}`));

const withoutDotSlash = (path: string): string =>
  path.startsWith(DOT_SLASH) ? path.slice(DOT_SLASH.length) : path;

export { isInnerPath, normalizePath, withoutDotSlash };
