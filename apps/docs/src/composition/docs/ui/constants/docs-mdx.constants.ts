import { defaultMdxComponents } from '#/libs/ui';

declare global {
  type MDXProvidedComponents = typeof mdxComponents;
}

export const mdxComponents = {
  ...defaultMdxComponents,
};
