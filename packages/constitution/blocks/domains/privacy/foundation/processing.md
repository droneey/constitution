# Processing

> Governs what personal data is processed: its inventory, notice, purpose, defaults, retention and recipients.

## Personal data

### personal-data-inventoried · MUST

Every kind of personal data the program collects, stores or passes on is listed with its purpose, the legal basis of that purpose, its retention period, the recipients it reaches — processors and controllers — and the regions it is sent to.

| Why |
|---|
| data nobody listed is kept beyond its purpose and missed by every request to export or erase it. |

### privacy-notice-follows-the-inventory · MUST

A person is told, where their data is collected, what is collected, for which purpose and on which basis, who receives it, how long it is kept and how to use their rights, and the notice changes with the inventory.

| Why |
|---|
| a person can use a right only over data they know is kept, and a notice written apart from the inventory drifts from what the program does. |

### personal-data-collected-only-for-its-purpose · MUST

Personal data is collected only as far as a stated purpose needs.

| Why |
|---|
| data never collected cannot leak, be misused or be asked for back. |

### sharing-settings-start-most-protective · MUST

The settings that share or expose a person's data start at their most protective, until the person changes them.

| Why |
|---|
| a person who never opens the settings is otherwise exposed by a default nobody chose for them. |

### personal-data-kept-no-longer-than-its-retention · MUST

Personal data is deleted or made anonymous when the retention period of its purpose ends.

| Why |
|---|
| data kept past its purpose is a liability that grows with every breach and every request. |

### personal-data-reaches-only-a-listed-recipient · MUST

Personal data reaches another company only when the inventory lists it as a recipient — a processor bound by terms to the program's purpose, or a controller with a legal basis of its own, the person's consent among them — and leaves the region whose law protects it only under a transfer that law allows.

| Why |
|---|
| data handed to a company nobody listed is data no request to export or erase reaches, under terms nobody read. |

### personal-data-kept-out-of-output · MUST

Personal data the program holds about the people it serves appears in no log, error, URL, build artefact, test data or document; a record is named there by an identifier that carries no personal data, and an error that reaches anyone but the data’s owner carries such identifiers, never the values it rejected. An audit record kept for security holds the identifier and the network address its event needs, and nothing more.

| Why |
|---|
| output is copied to places with weaker access than the data it came from, and a security audit needs to know who acted and from where, and no more. |

### high-risk-processing-assessed-before-it-starts · MUST

Where the law of the region asks for it, processing the inventory marks as high-risk to people — profiling, large-scale special categories, monitoring — starts only after an assessment of its impact, kept beside the inventory.

| Why |
|---|
| the law asks for the assessment before such processing begins, and a risk found after launch is found in people's data. |
