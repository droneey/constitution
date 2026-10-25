import { ProgramError } from '#/kernel/errors';

enum GrammarFailure {
  LineLeavesGrammar = 'line-leaves-grammar',
}

/** A line that leaves the grammar of constitution.yaml; the parser turns it into the line it stops at. */
class GrammarRefusal extends ProgramError<GrammarFailure, object> {
  public constructor() {
    super({
      code: GrammarFailure.LineLeavesGrammar,
      details: {},
    });
    this.name = 'GrammarRefusal';
  }
}

const isGrammarRefusal = (error: unknown): error is GrammarRefusal =>
  error instanceof GrammarRefusal;

export { GrammarFailure, GrammarRefusal, isGrammarRefusal };
