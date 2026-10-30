import type { Resolver } from '../models';

const designResolverUrl = new URL('file:///design/tokens/design.resolver.json');

const designResolver: Resolver = {
  sets: {
    base: {
      sources: [
        {
          $ref: 'color.tokens.json',
        },
        {
          $ref: 'size.tokens.json',
        },
      ],
    },
    motion: {
      sources: [
        {
          $ref: 'motion/motion.tokens.json',
        },
      ],
    },
  },
  modifiers: {
    theme: {
      contexts: {
        light: [
          {
            $ref: 'theme/light.tokens.json',
          },
        ],
        dark: [
          {
            $ref: 'theme/dark.tokens.json',
          },
          {
            $ref: '../shared/dark.tokens.json',
          },
        ],
      },
      default: 'dark',
    },
  },
};

const resolverWithDefault = (modeName: string): Resolver => ({
  ...designResolver,
  modifiers: {
    theme: {
      ...designResolver.modifiers.theme,
      default: modeName,
    },
  },
});

export { designResolver, designResolverUrl, resolverWithDefault };
