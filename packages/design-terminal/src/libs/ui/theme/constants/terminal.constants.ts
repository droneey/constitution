enum Tone {
  Accent = 'accent',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Muted = 'muted',
}

/** a status's symbol, so it reads without its colour */
enum Glyph {
  Step = 'step',
  Success = 'success',
  Failure = 'failure',
  Warning = 'warning',
  Info = 'info',
  Bullet = 'bullet',
  Pointer = 'pointer',
  Hint = 'hint',
}

/** the levels ansis takes */
enum ColourLevel {
  None = 0,
  Basic = 1,
  Ansi256 = 2,
  TrueColour = 3,
}

enum OutputMode {
  Pretty = 'pretty',
  Plain = 'plain',
}

enum Space {
  Xs = 'xs',
  Sm = 'sm',
  Md = 'md',
}

const GLYPHS: Readonly<Record<Glyph, string>> = {
  [Glyph.Step]: '▸',
  [Glyph.Success]: '✓',
  [Glyph.Failure]: '✗',
  [Glyph.Warning]: '⚠',
  [Glyph.Info]: 'ℹ',
  [Glyph.Bullet]: '•',
  [Glyph.Pointer]: '›',
  [Glyph.Hint]: '→',
};

const SPINNER_FRAMES: readonly string[] = [
  '⠋',
  '⠙',
  '⠹',
  '⠸',
  '⠼',
  '⠴',
  '⠦',
  '⠧',
  '⠇',
  '⠏',
];

const TONE_ROLES: Readonly<Record<Tone, string>> = {
  [Tone.Accent]: 'accent.text',
  [Tone.Success]: 'text.success',
  [Tone.Error]: 'text.danger',
  [Tone.Warning]: 'text.warning',
  [Tone.Info]: 'text.info',
  [Tone.Muted]: 'text.muted',
};

const FRAME_DURATION = 'fast';

/** a terminal cell stands for one step of the design system's 8-pixel grid */
const PIXELS_PER_CELL = 8;

export {
  ColourLevel,
  FRAME_DURATION,
  GLYPHS,
  Glyph,
  OutputMode,
  PIXELS_PER_CELL,
  SPINNER_FRAMES,
  Space,
  TONE_ROLES,
  Tone,
};
