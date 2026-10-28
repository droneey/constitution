import { ProgramError } from '#/kernel/errors';

enum PresetFileFailure {
  NodeLeavesGrammar = 'node-leaves-grammar',
}

interface NodePlace {
  readonly offset: number;
}

/**
 * A node a preset file's grammar refuses: an alias, a null, a tag but the two marks, a mark inside a
 * mark or on a list item; the parser turns it into the line it stops at.
 */
class PresetFileRefusal extends ProgramError<PresetFileFailure, NodePlace> {
  public constructor(place: NodePlace) {
    super({
      code: PresetFileFailure.NodeLeavesGrammar,
      details: place,
    });
    this.name = 'PresetFileRefusal';
  }
}

const isPresetFileRefusal = (error: unknown): error is PresetFileRefusal =>
  error instanceof PresetFileRefusal;

export { isPresetFileRefusal, PresetFileRefusal };
