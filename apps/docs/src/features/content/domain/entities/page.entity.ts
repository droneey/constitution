import { AXIS_FOLDERS } from './block.entity';

/** the segments of a page's address under the site's base */
type PageSlugs = readonly string[];

const MARKDOWN_EXTENSION = '.md';

const INDEX = 'index';

const withoutMarkdownExtension = (path: string): string =>
  path.endsWith(MARKDOWN_EXTENSION) ? path.slice(0, -MARKDOWN_EXTENSION.length) : path;

const linesOf = (markdown: string): readonly string[] => markdown.split('\n');

const titleOf = (markdown: string): string | undefined =>
  linesOf(markdown)
    .find((line) => line.startsWith('# '))
    ?.slice('# '.length);

/** still in Markdown */
const summaryLineOf = (markdown: string): string | undefined =>
  linesOf(markdown)
    .find((line) => line.startsWith('> '))
    ?.slice('> '.length);

/** a passport is `<id>/<id>.md`; an axis folder has none */
const isPassportPath = (path: string): boolean => {
  const [name, folder] = path.split('/').toReversed();

  return !AXIS_FOLDERS.some((axis) => axis === folder) && name === `${folder}${MARKDOWN_EXTENSION}`;
};

const pageSlugsOf = (path: string): PageSlugs => {
  const parts = withoutMarkdownExtension(path).split('/');

  return isPassportPath(path) ? parts.slice(0, -1) : parts;
};

const slugsOfMarkdownAddress = (segments: readonly string[]): PageSlugs => {
  const slugs = segments.map((segment, index) =>
    index === segments.length - 1 ? withoutMarkdownExtension(segment) : segment,
  );

  return slugs.length === 1 && slugs[0] === INDEX ? [] : slugs;
};

export type { PageSlugs };
export {
  isPassportPath,
  MARKDOWN_EXTENSION,
  pageSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  withoutMarkdownExtension,
};
