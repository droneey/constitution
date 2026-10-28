import { ProgramError } from '#/kernel/errors';

type Served = Readonly<
  Record<
    string,
    {
      body: unknown;
      status: number;
    }
  >
>;

interface TransportInit {
  signal: AbortSignal;
}

export const transportServing =
  (served: Served) =>
  (address: string, init: TransportInit): Promise<Response> => {
    const answer = served[address] ?? {
      body: 'Not Found',
      status: 404,
    };

    return init.signal.aborted
      ? Promise.reject(init.signal.reason)
      : Promise.resolve(
          new Response(JSON.stringify(answer.body), {
            status: answer.status,
          }),
        );
  };

export const transportSilent = (_address: string, init: TransportInit): Promise<Response> =>
  new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason));
  });

export const transportFailing = (error: Error) => (): Promise<Response> => Promise.reject(error);

export const failureOf = (read: Promise<unknown>): Promise<unknown> =>
  read.then(
    () => undefined,
    (error: unknown) =>
      error instanceof ProgramError
        ? {
            cause: error.cause instanceof Error ? error.cause.name : error.cause,
            code: error.code,
            details: error.details,
          }
        : error,
  );

export const versionsFileOf = (overrides: Readonly<Record<string, unknown>> = {}): unknown => ({
  latest: '0.70.0',
  versions: [
    '0.70.0',
    '0.69.2',
    '0.9.10',
  ],
  ...overrides,
});
