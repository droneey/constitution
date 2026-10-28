import type { IconLinkItem } from '#/libs/ui';
import { REPOSITORY_URL } from '#/shared/constants';

import { DocsRepositoryIcon } from './docs-repository-icon';

export const repositoryLink: IconLinkItem = {
  external: true,
  icon: <DocsRepositoryIcon />,
  label: 'GitHub',
  // Stryker disable next-line StringLiteral: the layouts show an icon link by its icon and label; the text they require is shown nowhere on this site
  text: 'GitHub',
  type: 'icon',
  url: REPOSITORY_URL,
};
