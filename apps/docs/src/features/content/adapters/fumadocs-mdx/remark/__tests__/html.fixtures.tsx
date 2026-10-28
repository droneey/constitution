import { createMarkdownRenderer } from 'fumadocs-core/content/md';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PluggableList } from 'unified';

interface MarkdownVariant {
  readonly markdown: string;
  readonly plugins: PluggableList;
}

/** the HTML a page shows of the Markdown, read with GitHub's tables and then the plugins, a tag on each line */
const htmlOf = ({ markdown, plugins }: MarkdownVariant): string => {
  const { Markdown } = createMarkdownRenderer({
    remarkPlugins: [
      remarkGfm,
      ...plugins,
    ],
  });

  return renderToStaticMarkup(<Markdown>{markdown}</Markdown>).replaceAll('><', '>\n<');
};

export type { MarkdownVariant };

/** each variant's HTML under a comment that names it, as one golden file holds them */
export const htmlOfVariants = (variants: Readonly<Record<string, MarkdownVariant>>): string =>
  Object.entries(variants)
    .map(([variant, markdownVariant]) => `<!-- ${variant} -->\n${htmlOf(markdownVariant)}`)
    .join('\n\n');
