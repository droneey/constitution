# Accounts

> Governs a session ended by a refused read.

## General

### unauthenticated-failure-handled-by-the-caches-on-error → unauthenticated-failure-ends-the-session-once · MUST

Every unauthenticated failure is acted on only by `onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client.

#### Why

A query or a mutation that acts on the error on its own ends the session in a way of its own, and one that forgets to leaves the user on a screen that no longer works.

#### Examples

```ts title="Avoid"
export const useOrders = (): UseQueryResult<readonly Order[]> => {
  const { listOrders } = use(UseCasesContext);
  const result = useQuery(ordersQueryOptions(listOrders));

  useEffect(() => {
    if (result.error instanceof UnauthenticatedError) {
      void signOut();
    }
  }, [result.error]);

  return result;
};
```

```ts title="Prefer"
// src/root/query-client.ts
export const createQueryClient = (session: Session): QueryClient => {
  const onError = (error: AppError): void => {
    if (error instanceof UnauthenticatedError) {
      session.end();
    }
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
  });
};
```
