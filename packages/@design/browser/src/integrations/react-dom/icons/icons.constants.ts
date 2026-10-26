import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Landmark,
  Tag,
  TextIcon,
} from 'lucide-react';

import type { IconGlyph } from './icons.types';

enum IconName {
  Expand = 'expand',
  Forward = 'forward',
  Home = 'home',
  Page = 'page',
  Selected = 'selected',
  Switch = 'switch',
  Version = 'version',
}

const iconGlyphs = {
  [IconName.Expand]: ChevronDown,
  [IconName.Forward]: ArrowRight,
  [IconName.Home]: Landmark,
  [IconName.Page]: TextIcon,
  [IconName.Selected]: Check,
  [IconName.Switch]: ChevronsUpDown,
  [IconName.Version]: Tag,
} satisfies Record<IconName, IconGlyph>;

export { IconName, iconGlyphs };
