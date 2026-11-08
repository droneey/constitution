# Security

> Governs what a device program holds, what it checks and the code it runs.

## Vocabulary

A **device program** is a program that runs on a device its user controls, whether or not it calls a server or another party, such as a browser tab, a phone app, a desktop program or a command-line tool.

A device's **protected store** is the store its platform guards for credentials and keys apart from the files and the storage other code on the device reads, such as the system's credential manager, a key store backed by hardware, or a browser's cookies that no script of its page can read.

## What it holds

### device-program-holds-nothing-hidden → secret-kept-out-of-output · MUST

Nothing a device program receives or keeps holds a secret its user may not read. That holds for a setting it receives at run time and for its data in memory or in storage.

| Why |
|---|
| the user controls the device and can read and change every byte that reaches it, so what a device program receives or keeps is output to its user as much as an answer or an artefact is, a setting sent at run time and data in storage included, and a secret sent there is handed to every user. |

### credential-stored-only-in-the-protected-store · MUST

Every credential a device program stores, such as a session or a token, is stored only in the protected store. It is never written where other code on the device can read it, such as storage every script of a page reads, a file another app reads or a backup. Exempt: a device program whose platform offers no protected store, which stores the credential in a file only its user can read.

| Why |
|---|
| code the program does not control (an injected script, a compromised dependency, another app) reads plain storage and sends what it finds away. |

### biometric-unlock-opens-a-protected-key · MUST

Every biometric unlock that guards data or an action opens it with a key, never with a yes alone. The key is one the protected store releases only after the unlock, whether by biometrics or by the device's passcode.

| Why |
|---|
| a prompt's yes is a value in the program's memory, which a tampered program returns without any finger, while a key the platform releases only after the unlock cannot be faked that way. |

### copied-secret-expires-from-the-clipboard · MUST

Wherever its platform lets it, every secret a device program copies to the clipboard expires from it. Such secrets include a one-time code, a password and a key.

| Why |
|---|
| other programs can read the clipboard, and a synced clipboard reaches the user's other devices, so a secret left there is read long after its use. |

## What it checks

### device-program-check-repeated-out-of-its-reach · MUST

Every check a device program makes that another party relies on is repeated where the device program cannot reach it. Such a check is of any kind, such as a validation, a permission, a limit or a price.

| Why |
|---|
| a device program's check is for the user's convenience, and a modified device program skips it, so a server or another party that trusts it acts on whatever the user chose to send. |

## What it runs

### downloaded-code-runs-only-with-the-projects-signature → download-checked-against-its-digest · MUST

Every piece of code the project sends an installed device program runs only once the device checks the project's signature on it. The signature is made over the code's digest with a key the project holds, and such code includes an update of its scripts sent over the air and a plugin or an extension the project publishes. Exempt: a page a browser runs, which has no install and whose code its origin serves at each load, and code its user chooses to install from another party.

| Why |
|---|
| an update channel that serves unsigned code lets whoever reaches it run their code in every installed copy, and a digest fetched beside the code is replaced with it. |

### release-build-carries-no-development-access · MUST

Every release build of a device program carries no development access. Development access is a development menu, a connection to a development server, or a flag or a setting that lets a debugger attach to the program.

| Why |
|---|
| each of these lets whoever holds the device read the program's memory, change its code or read its traffic. |
