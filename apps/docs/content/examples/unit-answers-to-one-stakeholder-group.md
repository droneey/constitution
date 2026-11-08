```pseudo title="Avoid"
# employees/employee.ts
class Employee
  # changed by finance
  function monthlyPay()
  # changed by operations
  function hoursReport()
  # changed by the database team
  function save()
```

```pseudo title="Prefer"
# payroll/pay-calculator.ts
function monthlyPay(employee)

# timesheets/hours-report.ts
function hoursReport(employee)

# employees/employee-store.ts
function saveEmployee(employee)
```
