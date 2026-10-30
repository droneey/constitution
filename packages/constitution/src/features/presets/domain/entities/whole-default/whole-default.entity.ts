import type { SettingMap } from '../setting/setting.entity';
import { Setting } from '../setting/setting.entity';

enum WholeKind {
  Added = 'added',
  Text = 'text',
}

type WholeDefault =
  | {
      readonly kind: WholeKind.Added;
      readonly setting: readonly Setting[] | SettingMap;
    }
  | {
      readonly kind: WholeKind.Text;
      readonly text: string;
    };

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
