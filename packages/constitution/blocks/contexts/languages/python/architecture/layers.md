# Layers

> Governs the layers in Python: which units may set a timer or import a module of the standard library that holds an effect.

## Effects

### timer-started-only-by-the-edge-and-binding-units → effects-held-only-by-the-edge · MUST

Python's timers are started only at the edge and in a binding unit that schedules its own work. They are `asyncio.sleep`, `loop.call_later`, `loop.call_at` and `threading.Timer`.

| Why |
|---|
| a timer reads the clock, so code that sets one outside them waits on time no spec can hand in. |

### standard-module-with-an-effect-imported-only-by-the-edge → effects-held-only-by-the-edge · MUST

Outside the edge, no module imports a module of the standard library that holds an effect. Those are `ctypes`, `curses`, `dbm`, `fcntl`, `fileinput`, `ftplib`, `getpass`, `glob`, `grp`, `imaplib`, `mmap`, `multiprocessing`, `os`, `platform`, `poplib`, `pty`, `pwd`, `random`, `resource`, `runpy`, `secrets`, `select`, `selectors`, `shelve`, `shutil`, `signal`, `smtplib`, `socket`, `socketserver`, `sqlite3`, `ssl`, `subprocess`, `syslog`, `tempfile`, `termios`, `time`, `tty`, `webbrowser`, `wsgiref` and `xmlrpc`.

| Why |
|---|
| each of these reaches the file system, the network, a process, randomness or the clock, so a unit of logic that imports one holds an effect no port shows, and its specs need the real effect or a patch of it. |
