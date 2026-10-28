import type { ReactElement } from 'react';

import { Text } from 'ink';

import { formatHeading } from '#/libs/ui';

import { useTheme } from '../../theme';

interface HeadingProps {
  readonly title: string;
}

function Heading({ title }: HeadingProps): ReactElement {
  const theme = useTheme();

  return <Text>{formatHeading(theme, title)}</Text>;
}

export type { HeadingProps };
export { Heading };
