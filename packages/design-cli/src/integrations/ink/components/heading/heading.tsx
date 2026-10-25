import type { ReactElement } from 'react';

import { Text } from 'ink';

import { formatHeading } from '#/libs/ui';

import { useTheme } from '../../hooks';
import type { HeadingProps } from './heading.types';

function Heading({ title }: HeadingProps): ReactElement {
  const theme = useTheme();

  return <Text>{formatHeading(theme, title)}</Text>;
}

export { Heading };
