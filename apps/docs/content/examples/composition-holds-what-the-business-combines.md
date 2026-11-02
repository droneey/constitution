```pseudo title="Avoid"
# presentation/account-summary
function AccountSummary({ customerId, listOrders, listRefunds }, context)
  let orders = listOrders({ customerId }, context)
  let refunds = listRefunds({ customerId }, context)
  let balance = sum(orders.totals) - sum(refunds.amounts)

  return Summary(balance)
```

```pseudo title="Prefer"
# composition/accounts/application/use-cases/queries/get-balance
import ListOrders from "features/orders"
import ListRefunds from "features/refunds"

function createGetBalance({ listOrders: ListOrders, listRefunds: ListRefunds })
  return function(input, context)
    let orders = listOrders({ customerId: input.customerId }, context)
    let refunds = listRefunds({ customerId: input.customerId }, context)

    return balance(orders, refunds)

# composition/accounts/presentation/bindings/queries/balance
import parseGetBalanceInput from "../../../application/use-cases"

function useBalance(customerId, getBalance, context)
  return getBalance(parseGetBalanceInput({ customerId }), context)

# presentation/account-summary
function AccountSummary(balance)
  return Summary(balance)
```
