const ORIGIN = 'http://localhost';

interface HandlerCall<TPath extends string, TContext, TParams> {
  readonly context: TContext;
  readonly next: () => never;
  readonly params: TParams;
  readonly pathname: TPath;
  readonly request: Request;
}

const noNextMiddleware = (): never => {
  throw new Error('a route with no component has no middleware after its handler');
};

const getCallOf = <TPath extends string, TContext, TParams>(
  pathname: TPath,
  context: TContext,
  params: TParams,
): HandlerCall<TPath, TContext, TParams> => ({
  context,
  next: noNextMiddleware,
  params,
  pathname,
  request: new Request(new URL(pathname, ORIGIN)),
});

const responseOf = async (answer: unknown): Promise<Response> => {
  const response = await answer;

  if (!(response instanceof Response)) {
    throw new TypeError('the handler answered with no response');
  }

  return response;
};

export { getCallOf, responseOf };
