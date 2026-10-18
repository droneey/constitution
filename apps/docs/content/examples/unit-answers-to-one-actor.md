```pseudo title="Avoid"
# employees/employee.ts
class Employee
  # changed by finance
  function calculatePay()
  # changed by operations
  function reportHours()
  # changed by the DBA
  function save()
```

```pseudo title="Prefer"
# payroll/pay-calculator.ts
function calculatePay(employee)

# timesheets/hours-report.ts
function reportHours(employee)

# employees/employee-store.ts
function saveEmployee(employee)
```
