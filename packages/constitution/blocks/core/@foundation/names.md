# Names

> Governs a name in the code.

## Vocabulary

An **outside system** is what the program reaches beyond its own code, such as a vendor's service, a database or another engine, a transport, a format or the clock.

A **store** keeps the program's own data beyond a run, such as a database, an index or a set of files.

A **client** is the object through which code reaches an outside system, holding the connection to it.

A **subcommand**{#subcommand} is one of the actions a command-line program runs by name.

An **event** is a value that records something that happened, such as a click a handler answers or a fact one part of the program announces to another.

A function is of one kind by what it does, and each kind takes its word.

An **act** changes something, in the sense the functions chapter gives the word, and a **read** answers from what a store or an outside system holds and changes nothing: each is a verb and its object.

A parse turns outside or flatter input into a structured value and may fail: **`parse`**{#parse-word} and the value it gives.

A **checked constructor** takes a value's own representation and fails only on its invariant, in the form the types chapter gives it.

A **factory** builds a unit from what it is handed: **`create`**{#create-word} and the unit.

A **starting transition** starts a value's life: the business's verb from the glossary for that start, such as place for an order or register for a user.

A **rebuild from storage** restores a stored value from what the store keeps of it and changes nothing: **`restore`**{#restore-word}, with what it rebuilds where the language's form needs it.

A **conversion** turns one value into another and cannot fail: **`to`**{#to-word} and its target, or **`from`**{#from-word} and its source on the target type.

A function that makes a value of the parts it is handed ends in **`of`**{#of-word}.

A **derived value** is computed from a value and changes nothing, and a function that renders a value makes one: each is named by a noun for what it returns.

A **predicate** answers yes or no and is named as a boolean is.

The **empty names**{#empty-names} are words such as `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `stuff` and `thing`, and the **empty verbs**{#empty-verbs} words such as `handle`, `process`, `manage`, `do` and `execute`.

The **dating words**{#dating-words} are words such as `new`, `old`, `v2`, `legacy`, `fixed`, `improved` and `final`.

A **hollow prefix**{#hollow-prefixes} is one of `validate`, `try`, `safe` and `make`, and a **boolean prefix**{#boolean-prefixes} one of `is`, `has`, `can`, `should`, `did` and `with`, the last for an option that adds a part to what it configures.

The **error suffix** is **`Error`**{#error-suffix}.

The **construct marks**{#construct-marks} are an `I` prefix and suffixes such as `Interface`, `Type`, `Class` and `Abstract`.

A unit's **role word** is the one word that names the role the unit plays in the program, such as `Port`, `Adapter`, `Service`, `Widget`, `Fake`, `Dto`, `Config` or `Schema`; the file of its one unit spells it as its suffix, as `.port`, `.fake`, `.dto`, `.config` or `.schema`.

A **collection suffix** marks a file that collects many things of one kind, such as `.utils`, `.types`, `.constants` and `.messages`, and, of the kinds' marks foundation's `layout` chapter names, `.test`, `.suite`, `.fixtures` and `.gen`; it is no role word.

Every word named here is a default.

## Meaning

### name-reveals-intent · SHOULD

Every name says what its thing is for.

| Why |
|---|
| code is read far more often than it is written, and every reader of a name that hides its purpose looks the purpose up again, or guesses it wrong. |

### name-spelled-in-whole-words · SHOULD

Every name is spelled in whole words, with no abbreviation the business does not already use.

| Why |
|---|
| an abbreviation the business does not use is decoded anew by each reader. |

### name-can-be-said-aloud · SHOULD

Every name can be said aloud as it is written.

| Why |
|---|
| a name that cannot be said aloud is misheard in every talk about it. |

### name-stands-out-in-a-search · SHOULD

Every name is searchable: a text search for it finds its own uses, not a crowd of other words that contain it.

| Why |
|---|
| a name a search cannot single out is missed by every search, so a change to it misses some of its uses. |

### name-from-the-glossary · SHOULD

Every name of the business is the glossary's word, never its vendor's or its store's. An operation the business offers is named by the business's verb, never by a word of building.

| Why |
|---|
| a name that differs from the word the business uses is translated at every request, and the translation is where a request is misread, while a vendor's or a store's word is renamed everywhere when they change. |

### concept-has-one-word · SHOULD

Every concept has one word, never two.

| Why |
|---|
| a reader who sees two words assumes two things, and a search for one misses the other. |

### word-has-one-concept · SHOULD

Every word names one concept, never two. Exempt: a word the glossary gives one meaning in each part of the program it names.

| Why |
|---|
| a word read in a meaning its part does not give it misleads, and its reader acts on the wrong thing. |

### undoing-acts-take-an-antonym-pair · SHOULD

Every pair of acts that undo each other takes a verb and its antonym, the same pair throughout.

| Why |
|---|
| a pair that is no verb and its antonym hides one half from the reader who looks for it. |

### name-never-an-empty-word · SHOULD

Every name says what its thing holds or does, never only an empty name or, for a function, an empty verb. Exempt: a value whose shape the code does not know, where the code says so, a handler named for the event it answers, and a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| an empty name makes the reader look up what it holds every time, and an empty verb says that a function does something, never what. |

### name-never-dates-its-thing · SHOULD

Every name says what its thing is, never when or how its code was written: it holds no dating word. Exempt: a version that is part of an API or a format, a word of the business, such as a new password, and a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| the moment a name records passes with the next change, and the name then lies. |

### function-named-for-what-it-does · SHOULD

Every function's name gives its kind in the word the vocabulary gives that kind, and no kind's word names another kind. The factory's word names only the building of a new valid value or unit by a factory or a checked constructor, and the word that makes a value of its parts ends no derived value's or conversion's name. Exempt: a handler named for the event it answers, and a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| a name that hides its kind leaves the caller to read the body before knowing whether a call acts, may fail on its input, builds, cannot fail or only answers, and two words for one kind split every search for it — command–query separation. |

### function-name-never-opens-with-a-hollow-prefix · SHOULD

No function's name opens with a hollow prefix. Exempt: a handler named for the event it answers, and a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| a hollow prefix says neither whether a call acts, may fail or builds, so its caller reads the body to learn what the name should have said — parse, don't validate. |

### member-name-never-repeats-its-owner · SHOULD

Every member's name says what sets it apart, never repeating the name of the type or the object it belongs to. Exempt: a name a module exports, which keeps its object, since it is read without its module.

| Why |
|---|
| the owner is written beside every use of its member, so its name said again is noise that hides the part that differs. |

### literal-with-a-meaning-is-named · MUST

Every literal with a meaning is a named constant. Such literals include a limit, a threshold and a key. Exempt: zero, one, an empty value and the literals of a test case.

| Why |
|---|
| a bare literal does not say what it means, and a repeated one is changed in one place and missed in another. |

## Form

### name-case-by-kind · SHOULD

Each kind of name takes the case its language's convention sets. The kinds are a type, a function, a variable, a constant, an enumeration and its members.

| Why |
|---|
| a name in a case its convention does not set for its kind no longer tells a reader whether it is a type, a value or a constant, so each name is looked up at its declaration. |

### type-name-undecorated · MUST

Every type's name says what its thing is, never marked with a construct mark. A role word, which `role-word-ends-the-name` places, marks the thing's role, never a construct. Exempt: a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| the declaration already shows the kind, the mark lengthens the name at every use, and it turns false the day the construct changes while the meaning stays. |

### role-word-ends-the-name · MUST

Every role word ends each spelling of its unit's name. It is the file's suffix, as in `order-repository.port`, the last word of the unit's type, as in `OrderRepositoryPort`, `SqlOrderRepositoryAdapter` or `OrderDto`, and, for a unit that is a folder, the last word of the folder's name, as in `patient-chart-widget/`, whose type is `PatientChartWidget`. Exempt: a type that is itself a thing of the domain, such as `Order`, `Patient`, `Money` or `OrderPlaced`, whose file alone carries the role word, as `order.aggregate` does; an error's type, whose name `error-name-ends-in-error` sets; and a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| a name whose last word differs between its file and its type makes its reader guess whether the two are one thing, and the role word at the place of use, in an argument, a trace or an editor's tab, is all that tells the role where no folder shows. |

### collection-suffix-ends-only-its-files-name · MUST

Every collection suffix ends only its file's name, never the name of a type the file holds, as `OrderTypes` or `DateUtils` would. Exempt: a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| a collection suffix in a type's name marks one thing with the kind of file that collects many, so its reader takes the type for the collection, or looks for the file's other members in it. |

### name-number-matches-its-value · SHOULD

Every name's grammatical number is the number of values it holds. A collection's name is plural and an item's singular, destructured names included, and a type's name, an enumeration's included, is singular. Exempt: the name of a type whose value is a collection.

| Why |
|---|
| a name in the wrong number makes a reader take a list for one of its elements or the reverse, and a plural type's name reads as a list where it holds one value. |

### boolean-name-is-a-positive-predicate · SHOULD

Every boolean's name is a positive predicate, never a negated one.

| Why |
|---|
| a negated name turns every check of it into a double negation, and the reader inverts it in their head at every use. |

### boolean-name-opens-with-a-boolean-prefix · SHOULD

Every boolean's name opens with a boolean prefix. Exempt: a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| a condition on a name that opens with a boolean prefix reads as a question with a yes-or-no answer, or as the part it switches on, where one without it reads as a value of some other type. |

### event-name-in-past-tense · SHOULD

Every event's name says what happened, in the past tense.

| Why |
|---|
| an event named in the imperative reads as an order to act, so a reader takes a fact that already happened for a request that may still be rejected. |

### error-name-ends-in-error · SHOULD

Every error type's name ends in the error suffix, the same for every error of the program. Exempt: a name a contract, a framework or the language's convention imposes.

| Why |
|---|
| an error named like a value is taken for one where it is caught, returned or logged, and the reader opens its declaration to tell a failure from a result. |

### value-name-carries-its-unit · SHOULD

The name of every number whose type does not carry its unit of measure carries that unit of measure.

| Why |
|---|
| a number without its unit of measure is read in the wrong one sooner or later, and the bug looks like correct code. |
