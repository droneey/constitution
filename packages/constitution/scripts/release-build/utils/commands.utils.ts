type ReleaseBuild =
  | {
      readonly from: string;
      /** external where the bundle leaves its packages for the project to install */
      readonly packages?: 'external' | undefined;
      readonly with: 'bun';
    }
  | {
      readonly from: string;
      /** the module and function the archive runs, as `<module>:<function>` */
      readonly main: string;
      readonly with: 'zipapp';
    };

/** Keyed by each file's path from the package. */
type ReleaseBuilds = Readonly<Record<string, ReleaseBuild>>;

const commandOf = ([file, build]: readonly [
  string,
  ReleaseBuild,
]): readonly string[] =>
  build.with === 'bun'
    ? [
        'bun',
        'build',
        '--target=bun',
        ...(build.packages === undefined
          ? []
          : [
              `--packages=${build.packages}`,
            ]),
        build.from,
        '--outfile',
        file,
      ]
    : [
        'python3',
        '-m',
        'zipapp',
        build.from,
        '-m',
        build.main,
        '-o',
        file,
      ];

/** Each command runs from the package's folder. */
const commandsOf = (builds: ReleaseBuilds): readonly (readonly string[])[] =>
  Object.entries(builds).map(commandOf);

export { commandsOf };
