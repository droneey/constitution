import type { KeyValue } from '#/libs/ui';

interface KeyValueListProps {
  /** the pairs, each named by its own key */
  readonly pairs: readonly KeyValue[];
}

export type { KeyValueListProps };
