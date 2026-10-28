import { failureLine } from '#/features/themes';

const ISSUES_URL = 'https://github.com/droneey/constitution/issues';

const lastResortLine = (message: string): string =>
  failureLine(
    `the generation stopped: ${message}; if it names no fault of the platform's configuration, report it with the command you ran at ${ISSUES_URL}`,
  );

export { lastResortLine };
