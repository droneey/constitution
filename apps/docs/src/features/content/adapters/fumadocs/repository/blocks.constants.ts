import { MARKDOWN_EXTENSION } from '../../../domain/entities';

const corePassport = `core${MARKDOWN_EXTENSION}`;

const AXIS_ITEM = /^- `[a-z]+\/`:/;

const FRONT_MATTER = /---\n([\s\S]*?)\n---\n/;

const SEAMS_FOLDER = 'with';

export { AXIS_ITEM, corePassport, FRONT_MATTER, SEAMS_FOLDER };
