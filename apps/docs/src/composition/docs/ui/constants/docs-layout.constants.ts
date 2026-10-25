import type { IconLinkItem } from '#/libs/ui';
import { GIT_CONFIG } from '#/shared/constants';

export const REPOSITORY_LINK: Omit<IconLinkItem, 'icon'> = {
  external: true,
  label: 'GitHub',
  // Stryker disable next-line StringLiteral: the layouts show an icon link by its icon and label; the text they require is shown nowhere on this site
  text: 'GitHub',
  type: 'icon',
  url: `https://github.com/${GIT_CONFIG.user}/${GIT_CONFIG.repo}`,
} as const;
