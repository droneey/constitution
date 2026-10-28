import type { TextsOf } from '#/shared/cli';
import { LIST_SEPARATOR, textOf } from '#/shared/cli';

import type { PresetsDetails, PresetsFinding } from '../../domain/entities';
import { PresetsCode } from '../../domain/entities';
import {
  ALL_SETTINGS,
  AT_TOP,
  entryMisplacedMessage,
  entryMisshapenMessage,
  loosenedMessage,
  missingMessage,
  moreSettingsMessage,
  PRESET_FILE_UNREADABLE,
  presetFileUnparsedMessage,
  presetsFindingMessages,
  sortedInUnsortableMessage,
  staleMessage,
  underKeysMessage,
  unneededBlocksMessage,
  unreachedRolesMessage,
  unsortedMessage,
} from './presets-finding-text.messages';

const SHOWN = 3;

const settingsOf = (settings: readonly string[]): string =>
  settings.length > SHOWN
    ? moreSettingsMessage({
        more: settings.length - SHOWN,
        shown: settings.slice(0, SHOWN).join(LIST_SEPARATOR),
      })
    : settings.join(LIST_SEPARATOR);

const presetsFindingTexts: TextsOf<PresetsDetails> = {
  ...presetsFindingMessages,
  [PresetsCode.PresetFileUnparsed]: ({ line }) =>
    line === undefined ? PRESET_FILE_UNREADABLE : presetFileUnparsedMessage(line),
  [PresetsCode.EntryMisplaced]: (details) =>
    [
      entryMisplacedMessage(details),
      details.unreachedRoles.length === 0 ? '' : unreachedRolesMessage(details.unreachedRoles),
      details.unneededBlocks.length === 0 ? '' : unneededBlocksMessage(details.unneededBlocks),
    ].join(''),
  [PresetsCode.EntryMisshapen]: ({ keys }) =>
    entryMisshapenMessage(keys.length === 0 ? AT_TOP : underKeysMessage(keys)),
  [PresetsCode.Loosened]: ({ setting, wanted }) =>
    loosenedMessage({
      held: setting === '' ? ALL_SETTINGS : setting,
      wanted,
    }),
  [PresetsCode.SortedInUnsortableFile]: ({ file, setting, ...named }) =>
    sortedInUnsortableMessage({
      file,
      named,
      sorted: setting === '' ? ALL_SETTINGS : setting,
    }),
  [PresetsCode.Missing]: ({ settings }) => missingMessage(settingsOf(settings)),
  [PresetsCode.Stale]: ({ settings }) => staleMessage(settingsOf(settings)),
  [PresetsCode.Unsorted]: ({ settings }) => unsortedMessage(settingsOf(settings)),
};

const presetsFindingTextOf = (finding: PresetsFinding): string =>
  textOf(presetsFindingTexts, finding.code, finding.details);

export { presetsFindingTextOf };
