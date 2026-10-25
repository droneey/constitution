import { Axis } from './block.entity';

/** the segments of a page's address under the site's base */
type PageSlugs = readonly string[];

/** where a page's compiled body is found: its collection, and its path in that collection */
interface PageLocation {
  readonly collection: string;
  readonly path: string;
}

interface Page extends PageLocation {
  readonly description: string;
  readonly title: string;
}

/** every page by its slugs joined with `/`, as the site exports them for the browser */
type PageCatalog = Readonly<Record<string, Page>>;

const catalogKeyOf = (slugs: PageSlugs): string => slugs.join('/');

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

  return (
    !Object.values(Axis).some((axis) => axis === folder) &&
    name === `${folder}${MARKDOWN_EXTENSION}`
  );
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

export type { Page, PageCatalog, PageLocation, PageSlugs };
export {
  catalogKeyOf,
  isPassportPath,
  MARKDOWN_EXTENSION,
  pageSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  withoutMarkdownExtension,
};
