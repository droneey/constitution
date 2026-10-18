/** what the site serves, by address: a status and a body as JSON */
type Served = Readonly<
  Record<
    string,
    {
      body: unknown;
      status: number;
    }
  >
>;

/** a transport that serves captured answers; one it has none for is 404, and an aborted request rejects as `fetch` does */
export const transportServing =
  (served: Served) =>
  (
    address: string,
    init: {
      signal: AbortSignal;
    },
  ): Promise<Response> => {
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

/** versions.json as the site publishes it */
export const versionsFileOf = (overrides: Readonly<Record<string, unknown>> = {}): unknown => ({
  latest: '0.70.0',
  versions: [
    '0.70.0',
    '0.69.2',
    '0.9.10',
  ],
  ...overrides,
});
