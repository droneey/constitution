enum Tone {
  Accent = 'accent',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Muted = 'muted',
}

/** so a status reads without its colour */
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
} as const;

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
] as const;

const ACCENT_TONE_ROLE = 'accent.text';

enum ColourRole {
  Success = 'text.success',
  Danger = 'text.danger',
  Warning = 'text.warning',
  Info = 'text.info',
  Muted = 'text.muted',
}

const TONE_ROLES: Readonly<Record<Exclude<Tone, Tone.Accent>, ColourRole>> = {
  [Tone.Success]: ColourRole.Success,
  [Tone.Error]: ColourRole.Danger,
  [Tone.Warning]: ColourRole.Warning,
  [Tone.Info]: ColourRole.Info,
  [Tone.Muted]: ColourRole.Muted,
} as const;

const FRAME_DURATION_TOKEN = 'fast';

const PIXELS_PER_CELL = 8;

export {
  ACCENT_TONE_ROLE,
  ColourLevel,
  ColourRole,
  FRAME_DURATION_TOKEN,
  GLYPHS,
  Glyph,
  OutputMode,
  PIXELS_PER_CELL,
  SPINNER_FRAMES,
  Space,
  TONE_ROLES,
  Tone,
};
