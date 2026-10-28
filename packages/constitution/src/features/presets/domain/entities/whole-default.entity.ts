import type { SettingMap } from './setting.entity';
import { Setting } from './setting.entity';

enum WholeKind {
  /** lines or keys, each added where the file lacks it */
  Added = 'added',
  /** a text, written while the file is absent */
  Text = 'text',
}

/** A file as a default. */
type WholeDefault =
  | {
      readonly kind: WholeKind.Added;
      readonly setting: readonly Setting[] | SettingMap;
    }
  | {
      readonly kind: WholeKind.Text;
      readonly text: string;
    };

/** What the united defaults of a file make of it; none, a number or a flag is no file. */
const of = (whole: Setting | undefined): WholeDefault | undefined => {
  if (typeof whole === 'string') {
    return {
      kind: WholeKind.Text,
      text: whole,
    };
  }

  return Setting.isList(whole) || Setting.isMap(whole)
    ? {
        kind: WholeKind.Added,
        setting: whole,
      }
    : undefined;
};

const WholeDefault = {
  of,
} as const;

export { WholeDefault, WholeKind };
