// What every command takes from the root: the streams of the run, the folders it starts in, and
// the program's one error handler, which ends the run by the exit map.
interface CommandIo {
  readonly readInput: () => Promise<string>;
  readonly write: (text: string) => void;
  readonly writeError: (text: string) => void;
}

interface CommandPlaces {
  // the folder the run starts in
  readonly cwd: string;
  // the project Claude Code names, '' when it names none
  readonly projectDir: string;
}

interface CommandRun {
  readonly io: CommandIo;
  readonly places: CommandPlaces;
  // runs a command's work through the program's error handler; prefix opens each failure it writes
  readonly run: (input: { prefix: string; work: () => Promise<void> | void }) => Promise<void>;
  // ends the run with the code of a failure the user can act on
  readonly setFailed: () => void;
}

export type { CommandIo, CommandPlaces, CommandRun };
