# Processing

> Governs what personal data is processed: its inventory, notice and assessment, what is collected and shared by default, how long it is kept, and where it goes.

## Inventory

### personal-data-inventoried · MUST

Every kind of personal data the program handles is inventoried. Each kind it collects, stores or passes on is listed with its purpose, the legal basis of that purpose, its retention period, the recipients it reaches — processors and controllers — and the regions it is sent to.

| Why |
|---|
| data nobody listed is kept beyond its purpose and missed by every request to export or erase it. |

### privacy-notice-follows-the-inventory · MUST

A person is told what the inventory holds about their data, and the notice changes with the inventory. Where their data is collected, they are told what is collected, for which purpose and on which basis, who receives it, how long it is kept and how to use their rights.

| Why |
|---|
| a person can use a right only over data they know is kept, and a notice written apart from the inventory drifts from what the program does. |

### high-risk-processing-assessed-before-it-starts · MUST

High-risk processing starts only after an assessment of its impact. Where the law of the region asks for it, processing the inventory marks as high-risk to people — profiling, large-scale special categories, monitoring — waits for the assessment, which is kept beside the inventory.

| Why |
|---|
| the GDPR's Article 35 asks for the assessment before such processing begins, and a risk found after launch is found in people's data. |

## Collection

### personal-data-collected-only-for-its-purpose · MUST

Personal data is collected only as far as a stated purpose needs.

| Why |
|---|
| data collected beyond what a purpose needs can leak, be misused and must be found for every request, though nothing needed it — data minimisation. |

### sharing-settings-start-most-protective · MUST

The settings that share or expose a person's data start at their most protective, until the person changes them.

| Why |
|---|
| a person who never opens the settings is otherwise exposed by a default nobody chose for them — privacy by default. |

## Retention

### personal-data-kept-no-longer-than-its-retention · MUST

Personal data is deleted or made anonymous when the retention period of its purpose ends.

| Why |
|---|
| data kept past its purpose is a liability that grows with every breach and every request. |

## Recipients and output

### personal-data-reaches-only-a-listed-recipient · MUST

Personal data reaches only a recipient the inventory lists, and leaves its region only under a transfer its law allows. A recipient is another company — a processor bound by terms to the program's purpose, or a controller with a legal basis of its own, the person's consent among them — and the data leaves the region whose law protects it only under a transfer that law allows.

| Why |
|---|
| data handed to a company nobody listed is data no request to export or erase reaches, under terms nobody read, and data sent out of its region under no allowed transfer loses the protection the GDPR gave it. |

### personal-data-kept-out-of-output · MUST

Personal data stays out of every output. What the program holds about the people it serves appears in no log, error, URL, build artefact, test data or document; a record is named there by an identifier that carries no personal data, and an error that reaches anyone but the data’s owner carries such identifiers, never the values it rejected. An audit record kept for security holds the identifier and the network address its event needs, and nothing more.

| Why |
|---|
| output is copied to places with weaker access than the data it came from, so personal data written there reaches people it was never meant for, and an audit record that holds more than who acted and from where becomes one more such copy. |
