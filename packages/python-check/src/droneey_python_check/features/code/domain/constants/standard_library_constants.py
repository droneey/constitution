from typing import Final

# The standard library's modules of input and output, the clock, randomness and identifiers,
# which only the edge imports.
EFFECT_MODULE_NAMES: Final = frozenset(
  {
    'ctypes',
    'curses',
    'dbm',
    'fcntl',
    'fileinput',
    'ftplib',
    'getpass',
    'glob',
    'grp',
    'imaplib',
    'mmap',
    'multiprocessing',
    'os',
    'platform',
    'poplib',
    'pty',
    'pwd',
    'random',
    'resource',
    'runpy',
    'secrets',
    'select',
    'selectors',
    'shelve',
    'shutil',
    'signal',
    'smtplib',
    'socket',
    'socketserver',
    'sqlite3',
    'ssl',
    'subprocess',
    'syslog',
    'tempfile',
    'termios',
    'time',
    'tty',
    'webbrowser',
    'wsgiref',
    'xmlrpc',
  }
)
# What of the standard library reaches an effect although its module's types are pure,
# by its dotted name.
EFFECT_NAMES: Final = frozenset(
  {
    'asyncio.create_subprocess_exec',
    'asyncio.create_subprocess_shell',
    'asyncio.open_connection',
    'asyncio.open_unix_connection',
    'asyncio.start_server',
    'asyncio.subprocess',
    'bz2.open',
    'codecs.open',
    'datetime.date.today',
    'datetime.datetime.now',
    'datetime.datetime.today',
    'datetime.datetime.utcnow',
    'gzip.open',
    'http.client',
    'http.server',
    'importlib.metadata',
    'input',
    'io.open',
    'locale.setlocale',
    'lzma.open',
    'open',
    'Path.cwd',
    'Path.home',
    'pathlib.Path.cwd',
    'pathlib.Path.home',
    'sys.argv',
    'sys.exit',
    'sys.stderr',
    'sys.stdin',
    'sys.stdout',
    'tarfile.open',
    'urllib.request',
    'uuid.getnode',
    'uuid.uuid1',
    'uuid.uuid4',
    'uuid.uuid6',
    'uuid.uuid7',
    'uuid.uuid8',
    'zipfile.ZipFile',
  }
)
# The module whose classes reach the clock through calls such as `datetime.now()`.
DATETIME_MODULE_NAME: Final = 'datetime'
# A timer, which a binding unit alone may hold to schedule its own work.
TIMER_NAMES: Final = frozenset({'asyncio.sleep', 'threading.Timer'})
# What reads or changes the environment, which only the root and the entry files reach.
ENVIRONMENT_NAMES: Final = frozenset(
  {'os.environ', 'os.environb', 'os.getenv', 'os.getenvb', 'os.putenv', 'os.unsetenv'}
)
