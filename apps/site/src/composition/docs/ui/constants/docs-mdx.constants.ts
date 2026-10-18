import { defaultMdxComponents } from '#/libs/ui';

declare global {
  type MDXProvidedComponents = typeof mdxComponents;
}

/** the components the pages' Markdown renders with */
export const mdxComponents = {
  ...defaultMdxComponents,
};
