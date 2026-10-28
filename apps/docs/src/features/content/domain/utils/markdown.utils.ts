import { MARKDOWN_EXTENSION } from '../constants';

const withoutMarkdownExtension = (path: string): string =>
  path.endsWith(MARKDOWN_EXTENSION) ? path.slice(0, -MARKDOWN_EXTENSION.length) : path;

export { withoutMarkdownExtension };
