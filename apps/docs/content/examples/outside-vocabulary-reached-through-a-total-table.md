```pseudo
# shipping/domain/shipment/value-objects/shipment-status.value-object
type ShipmentStatus = InTransit | Delivered | Lost | UnknownStatus

# shipping/infrastructure/carrier/models/carrier-status.model
import ShipmentStatus from "../../../domain/shipment/value-objects"

# total: the checker refuses a carrier code with no entry
let statusByCarrierCode: Record<CarrierCode, ShipmentStatus> = {
  "IT": InTransit,
  "DL": Delivered,
  "LS": Lost
}

function toShipmentStatus(code: String): ShipmentStatus
  if code in statusByCarrierCode then
    return statusByCarrierCode[code]

  # a code the carrier added since: the read goes on
  return UnknownStatus
```
