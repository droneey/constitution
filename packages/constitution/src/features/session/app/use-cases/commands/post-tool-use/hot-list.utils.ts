import type { AbsolutePath } from '#/kernel/value-objects';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { HotReminder, HotRule } from '../../../../domain/entities';
import {
  capShareOf,
  countedNoteOf,
  entriesWithin,
  listWithin,
  moreFilesText,
} from '../../../utils';
import { hotHeadingMessage, hotRuleLineMessage, leftOutFilesText } from './hot-list.messages';

const CAP_SHARES_PERCENT = {
  groupPaths: 10,
  hotList: 45,
} as const;

interface HotGroup {
  readonly paths: readonly AbsolutePath[];
  readonly rules: readonly HotRule[];
}

const groupsOf = (reminders: readonly HotReminder[]): readonly HotGroup[] => {
  const groups = new Map<string, HotGroup>();

  for (const reminder of reminders) {
    const key = JSON.stringify(reminder.rules);

    groups.set(key, {
      paths: [
        ...(groups.get(key)?.paths ?? []),
        reminder.path,
      ],
      rules: reminder.rules,
    });
  }

  return [
    ...groups.values(),
  ];
};

const groupLinesOf = (group: HotGroup): readonly string[] => [
  hotHeadingMessage(
    listWithin({
      budget: capShareOf(CAP_SHARES_PERCENT.groupPaths),
      lines: group.paths,
      note: moreFilesText,
    }).join(LIST_SEPARATOR),
  ),
  ...group.rules.map(hotRuleLineMessage),
];

const pathCountOf = (groups: readonly HotGroup[]): number =>
  groups.reduce((sum, group) => sum + group.paths.length, 0);

const hotListLines = (reminders: readonly HotReminder[]): readonly string[] => {
  const groups = groupsOf(reminders);
  const given = entriesWithin({
    budget: capShareOf(CAP_SHARES_PERCENT.hotList),
    entries: groups,
    linesOf: groupLinesOf,
  });

  return [
    ...given.flatMap(groupLinesOf),
    ...countedNoteOf({
      count: pathCountOf(groups) - pathCountOf(given),
      note: leftOutFilesText,
    }),
  ];
};

export { hotListLines };
