import { ProgramError } from '#/kernel/errors';

enum CatalogueFailure {
  NodeLeavesGrammar = 'node-leaves-grammar',
}

interface NodePlace {
  readonly offset: number;
}

/**
 * A node a catalogue's grammar refuses: an alias, a null, a tag but the two marks, a mark inside a
 * mark or on a list item; the parser turns it into the line it stops at.
 */
class CatalogueRefusal extends ProgramError<CatalogueFailure, NodePlace> {
  public constructor(place: NodePlace) {
    super({
      code: CatalogueFailure.NodeLeavesGrammar,
      details: place,
    });
    this.name = 'CatalogueRefusal';
  }
}

const isCatalogueRefusal = (error: unknown): error is CatalogueRefusal =>
  error instanceof CatalogueRefusal;

export { CatalogueRefusal, isCatalogueRefusal };
