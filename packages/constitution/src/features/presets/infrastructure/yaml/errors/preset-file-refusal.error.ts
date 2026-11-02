import { ProgramError } from '#/kernel/errors';

enum PresetFileFailure {
  NodeLeavesGrammar = 'node-leaves-grammar',
}

interface NodePlace {
  readonly offset: number;
}

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
