```pseudo
# shipping/adapters/carrier-status.ts
type ShipmentStatus = InTransit | Delivered | Lost | UnknownStatus

# total: the checker refuses a carrier code with no entry
let statusByCarrierCode: Record<CarrierCode, ShipmentStatus> = {
  "IT": InTransit,
  "DL": Delivered,
  "LS": Lost
}

function shipmentStatusOf(code: String): ShipmentStatus
  if code in statusByCarrierCode then
    return statusByCarrierCode[code]
  # a code the carrier added since: the read goes on
  return UnknownStatus
```
