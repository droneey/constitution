import type { SettingPlace } from '../../domain/apply-plan/entities';

const FILE_NOUN = 'file';
const NOTE_NOUN = 'note';
const SETTING_NOUN = 'setting';

const WRITTEN_AFTER = 'written';
const DELETED_AFTER = 'deleted, which the apply created and nothing holds any longer';
const REMOVED_AFTER = 'removed, which no entry gives any longer';
const ADDED_AFTER = 'added as defaults to files that were there';
const NOTED_AFTER = 'on what the apply wrote';

const writtenMessage = (files: string): string => `${files} ${WRITTEN_AFTER}`;

const placeMessage = ({ filePath, settingPath }: SettingPlace): string =>
  `${filePath}: ${settingPath}`;

export {
  ADDED_AFTER,
  DELETED_AFTER,
  FILE_NOUN,
  NOTE_NOUN,
  NOTED_AFTER,
  placeMessage,
  REMOVED_AFTER,
  SETTING_NOUN,
  WRITTEN_AFTER,
  writtenMessage,
};
