import { Glyph, Tone } from '../theme';

enum StepStatus {
  Pending = 'pending',
  Running = 'running',
  Done = 'done',
  Failed = 'failed',
  Warned = 'warned',
  Skipped = 'skipped',
}

enum ColumnAlign {
  Start = 'start',
  End = 'end',
}

interface Look {
  readonly glyph: Glyph;
  readonly tone: Tone;
}

const STEP_LOOKS: Readonly<Record<StepStatus, Look>> = {
  [StepStatus.Pending]: {
    glyph: Glyph.Bullet,
    tone: Tone.Muted,
  },
  [StepStatus.Running]: {
    glyph: Glyph.Step,
    tone: Tone.Accent,
  },
  [StepStatus.Done]: {
    glyph: Glyph.Success,
    tone: Tone.Success,
  },
  [StepStatus.Failed]: {
    glyph: Glyph.Failure,
    tone: Tone.Error,
  },
  [StepStatus.Warned]: {
    glyph: Glyph.Warning,
    tone: Tone.Warning,
  },
  [StepStatus.Skipped]: {
    glyph: Glyph.Bullet,
    tone: Tone.Muted,
  },
};

const TONE_GLYPHS: Readonly<Record<Tone, Glyph>> = {
  [Tone.Accent]: Glyph.Step,
  [Tone.Success]: Glyph.Success,
  [Tone.Error]: Glyph.Failure,
  [Tone.Warning]: Glyph.Warning,
  [Tone.Info]: Glyph.Info,
  [Tone.Muted]: Glyph.Bullet,
};

const BAR_FILLED = '█';
const BAR_LEFT = '░';
const BAR_CELLS = 20;

const PERCENT = 100;

const ELLIPSIS = '…';

const DETAIL_SEPARATOR = ' — ';

export {
  BAR_CELLS,
  BAR_FILLED,
  BAR_LEFT,
  ColumnAlign,
  DETAIL_SEPARATOR,
  ELLIPSIS,
  PERCENT,
  STEP_LOOKS,
  StepStatus,
  TONE_GLYPHS,
};
