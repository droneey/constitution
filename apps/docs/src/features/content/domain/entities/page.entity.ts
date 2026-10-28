import { MARKDOWN_EXTENSION, PATH_SEPARATOR } from '../constants';
import { withoutMarkdownExtension } from '../utils';
import type { BlockPath } from '../value-objects';
import { PageSlugs } from '../value-objects';
import { Axis } from './block.entity';

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

const catalogKeyOf = (slugs: readonly string[]): string => slugs.join(PATH_SEPARATOR);

/** one page apart from every other, though two collections hold the README under one path */
const keyOf = ({ collection, path }: PageLocation): string => `${collection}:${path}`;

/** a passport is `<id>/<id>.md`; an axis folder has none */
const isPassportPath = (blockPath: BlockPath): boolean => {
  const [fileName, folderName] = blockPath.split(PATH_SEPARATOR).toReversed();

  return (
    !Object.values(Axis).some((axis) => axis === folderName) &&
    fileName === `${folderName}${MARKDOWN_EXTENSION}`
  );
};

/** @throws {@link InvalidValueError} when no page can have the block's address */
const slugsOf = (blockPath: BlockPath): PageSlugs => {
  const segments = withoutMarkdownExtension(blockPath).split(PATH_SEPARATOR);

  return PageSlugs.create(isPassportPath(blockPath) ? segments.slice(0, -1) : segments);
};

const addressOf = (baseUrl: string, blockPath: BlockPath): string =>
  [
    baseUrl,
    ...slugsOf(blockPath),
  ].join(PATH_SEPARATOR);

const Page = {
  addressOf,
  catalogKeyOf,
  isPassportPath,
  keyOf,
  slugsOf,
} as const;

export type { PageCatalog, PageLocation };
export { Page };
