import type { PluginRow } from './ast-grep-plugins.fixtures';

const pythonUnit = {
  blocks: [],
};

const pythonPluginRows: readonly PluginRow[] = [
  {
    language: 'python',
    slug: 'init-of-a-folder-without-a-surface-empty',
    unit: pythonUnit,
    reported: [
      {
        condition: "the features folder's init imports a feature",
        files: {
          'src/shop/features/__init__.py': 'from .orders import place_order\n',
        },
      },
      {
        condition: "a feature's domain layer offers its members",
        files: {
          'src/shop/features/orders/domain/__init__.py':
            'from .order.entities.order_aggregate import DraftOrder\n\n__all__ = ["DraftOrder"]\n',
        },
      },
      {
        condition: 'a concept folder offers its aggregate',
        files: {
          'src/shop/features/orders/domain/order/__init__.py':
            'from .entities.order_aggregate import DraftOrder\n',
        },
      },
      {
        condition: 'a concept folder named like a layer offers its aggregate',
        files: {
          'src/slides/features/decks/domain/presentation/__init__.py':
            'from .entities.presentation_aggregate import Presentation\n',
        },
      },
      {
        condition: "a domain layer's shared folder holds a docstring",
        files: {
          'src/shop/features/orders/domain/shared/__init__.py': '"""Shared pieces."""\n',
        },
      },
      {
        condition: "a composition module's application layer declares a value",
        files: {
          'src/shop/composition/checkout/application/__init__.py': 'TIMEOUT = 3\n',
        },
      },
      {
        condition: 'the kernel offers its contracts',
        files: {
          'src/shop/kernel/__init__.py': 'from .contracts import ClockPort\n',
        },
      },
      {
        condition: "the program's presentation offers a router",
        files: {
          'src/shop/presentation/__init__.py': 'from .bindings import build_router\n',
        },
      },
      {
        condition: "a feature's infrastructure layer offers an adapter",
        files: {
          'src/shop/features/orders/infrastructure/__init__.py':
            'from .postgres import PostgresOrderRepositoryAdapter\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a layer folder's init is empty",
        files: {
          'src/shop/features/orders/domain/__init__.py': '',
        },
      },
      {
        condition: "a layer folder's init holds only a comment",
        files: {
          'src/shop/features/orders/application/__init__.py': '# The application layer.\n',
        },
      },
      {
        condition: "the root's init offers the program's run",
        files: {
          'src/shop/root/__init__.py': 'from .run import run\n\n__all__ = ["run"]\n',
        },
      },
      {
        condition: "a feature's surface offers its operations",
        files: {
          'src/shop/features/orders/__init__.py':
            'from .application.use_cases.commands.place_order_use_case import place_order\n',
        },
      },
      {
        condition: 'a role folder of a concept offers its aggregate',
        files: {
          'src/shop/features/orders/domain/order/entities/__init__.py':
            'from .order_aggregate import DraftOrder\n',
        },
      },
      {
        condition: "an adapter module's surface offers its adapter",
        files: {
          'src/shop/features/orders/infrastructure/postgres/__init__.py':
            'from .order_repository_adapter import PostgresOrderRepositoryAdapter\n',
        },
      },
      {
        condition: "a lib's surface offers its client",
        files: {
          'src/shop/libs/stripe/__init__.py': 'from .stripe_client import StripeClient\n',
        },
      },
      {
        condition: 'a feature is named like a layer',
        files: {
          'src/slides/features/presentation/__init__.py':
            'from .application.use_cases.commands.publish_use_case import publish\n',
        },
      },
      {
        condition: 'a role folder of the application offers its ports',
        files: {
          'src/shop/features/orders/application/contracts/__init__.py':
            'from .clock_port import ClockPort\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'surface-is-init-with-sorted-all',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a surface re-exports with no __all__',
        files: {
          'src/shop/features/orders/__init__.py':
            'from .application.use_cases.commands.place_order_use_case import place_order\n',
        },
      },
      {
        condition: 'a surface holds a docstring',
        files: {
          'src/shop/kernel/errors/__init__.py':
            '"""The errors every port declares."""\n\nfrom .base_error import BaseError\n\n__all__ = ["BaseError"]\n',
        },
      },
      {
        condition: 'a surface declares a constant',
        files: {
          'src/shop/features/orders/__init__.py':
            'from .domain.order.value_objects.order_id_value_object import OrderId\n\nLIMIT = 10\n\n__all__ = ["OrderId"]\n',
        },
      },
      {
        condition: 'a surface imports a module by its absolute name',
        files: {
          'src/shop/kernel/errors/__init__.py':
            'from shop.kernel.errors.base_error import BaseError\n\n__all__ = ["BaseError"]\n',
        },
      },
      {
        condition: 'a surface imports from its parent package',
        files: {
          'src/shop/kernel/errors/__init__.py':
            'from ..contracts.clock_port import ClockPort\n\n__all__ = ["ClockPort"]\n',
        },
      },
      {
        condition: 'a surface imports everything of a module',
        files: {
          'src/shop/kernel/errors/__init__.py':
            'from .base_error import *\n\n__all__ = ["BaseError"]\n',
        },
      },
      {
        condition: 'a surface defines a function',
        files: {
          'src/shop/libs/stripe/__init__.py':
            'from .stripe_client import StripeClient\n\n\ndef client_of(key: str) -> StripeClient:\n    return StripeClient(key)\n\n\n__all__ = ["StripeClient", "client_of"]\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a surface re-exports by name and lists them in __all__',
        files: {
          'src/shop/features/orders/__init__.py':
            'from .application.use_cases.commands.cancel_order_use_case import cancel_order\nfrom .application.use_cases.commands.place_order_use_case import place_order\n\n__all__ = ["cancel_order", "place_order"]\n',
        },
      },
      {
        condition: 'a surface re-exports a name under its own name',
        files: {
          'src/shop/kernel/errors/__init__.py':
            'from .base_error import BaseError as BaseError\n\n__all__ = ("BaseError",)\n',
        },
      },
      {
        condition: 'a folder with no surface keeps its init empty',
        files: {
          'src/shop/features/orders/domain/__init__.py': '',
        },
      },
      {
        condition: 'a surface carries a comment beside its re-exports',
        files: {
          'src/shop/kernel/errors/__init__.py':
            '# The errors every port declares.\nfrom .base_error import BaseError\n\n__all__ = ["BaseError"]\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'feature-init-leaves-out-the-rebuild',
    unit: {
      blocks: [
        'data',
      ],
    },
    reported: [
      {
        condition: "a feature's surface imports its aggregate's rebuild",
        files: {
          'src/shop/features/orders/__init__.py':
            'from .application.use_cases.commands.place_order_use_case import place_order\nfrom .domain.order.entities.order_aggregate import restore_order\n\n__all__ = ["place_order", "restore_order"]\n',
        },
      },
      {
        condition: "a feature's surface imports the rebuild under another name",
        files: {
          'src/shop/features/orders/__init__.py':
            'from .domain.order.entities.order_aggregate import restore_order as order_of_row\n',
        },
      },
      {
        condition: "a composition module's surface lists the rebuild in __all__",
        files: {
          'src/shop/composition/checkout/__init__.py': '__all__ = ["restore_checkout"]\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a feature's surface offers its operations alone",
        files: {
          'src/shop/features/orders/__init__.py':
            'from .application.use_cases.commands.place_order_use_case import place_order\n\n__all__ = ["place_order"]\n',
        },
      },
      {
        condition: "the aggregate's role folder offers the rebuild to the adapters",
        files: {
          'src/shop/features/orders/domain/order/entities/__init__.py':
            'from .order_aggregate import restore_order\n\n__all__ = ["restore_order"]\n',
        },
      },
      {
        condition:
          "a feature's surface offers an operation whose name opens with restore's letters",
        files: {
          'src/shop/features/orders/__init__.py':
            'from .application.use_cases.commands.restock_use_case import restock\n\n__all__ = ["restock"]\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'case-named-test-should',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a case is named without should',
        files: {
          'tests/unit/test_orders.py': 'def test_cancel() -> None:\n    assert True\n',
        },
      },
      {
        condition: 'a case names its condition with no behaviour',
        files: {
          'tests/unit/test_orders.py':
            'def test_should_when_the_order_is_a_draft() -> None:\n    assert True\n',
        },
      },
      {
        condition: 'a case ends on an empty condition',
        files: {
          'tests/unit/test_orders.py': 'def test_should_cancel_when() -> None:\n    assert True\n',
        },
      },
      {
        condition: 'a method of a test class is named without should',
        files: {
          'tests/unit/test_orders.py':
            'class TestOrders:\n    def test_cancels(self) -> None:\n        assert True\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a case names its behaviour and its condition',
        files: {
          'tests/unit/test_orders.py':
            'def test_should_cancel_when_the_order_is_a_draft() -> None:\n    assert True\n',
        },
      },
      {
        condition: 'a case names its behaviour alone',
        files: {
          'tests/unit/test_orders.py': 'def test_should_cancel() -> None:\n    assert True\n',
        },
      },
      {
        condition: 'a fixture is named like a case',
        files: {
          'tests/unit/conftest.py':
            '@pytest.fixture\ndef test_client() -> Client:\n    return Client()\n',
        },
      },
      {
        condition: 'a helper of the spec takes another name',
        files: {
          'tests/unit/test_orders.py':
            'def a_draft_order() -> DraftOrder:\n    return DraftOrder()\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'async-work-started-in-a-task-group',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a task is created by asyncio',
        files: {
          'src/shop/orders.py':
            'async def confirm(order: Order) -> None:\n    asyncio.create_task(send_receipt(order))\n',
        },
      },
      {
        condition: 'tasks are gathered',
        files: {
          'src/shop/orders.py':
            'async def confirm(order: Order) -> None:\n    await asyncio.gather(send_receipt(order), reserve_stock(order))\n',
        },
      },
      {
        condition: 'a future is ensured',
        files: {
          'src/shop/orders.py':
            'def start(work: Coroutine) -> None:\n    asyncio.ensure_future(work)\n',
        },
      },
      {
        condition: 'gather is imported from asyncio',
        files: {
          'src/shop/orders.py': 'from asyncio import gather\n',
        },
      },
      {
        condition: 'a task is created on the running loop',
        files: {
          'src/shop/orders.py':
            'async def confirm(order: Order) -> None:\n    loop = asyncio.get_running_loop()\n    loop.create_task(send_receipt(order))\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'tasks start in a task group',
        files: {
          'src/shop/orders.py':
            'async def confirm(order: Order) -> None:\n    async with asyncio.TaskGroup() as group:\n        group.create_task(send_receipt(order))\n        group.create_task(reserve_stock(order))\n',
        },
      },
      {
        condition: 'an awaited call runs alone',
        files: {
          'src/shop/orders.py':
            'async def confirm(order: Order) -> None:\n    await send_receipt(order)\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'cancellation-always-re-raised',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a cancellation is caught and swallowed',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    try:\n        await outbox.relay_forever()\n    except asyncio.CancelledError:\n        await outbox.flush()\n',
        },
      },
      {
        condition: 'a base exception is caught and logged',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    try:\n        await outbox.relay_forever()\n    except BaseException as error:\n        _logger.exception("relay stopped", exc_info=error)\n',
        },
      },
      {
        condition: 'a bare except swallows everything',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    try:\n        await outbox.relay_forever()\n    except:\n        return\n',
        },
      },
      {
        condition: 'a tuple of exceptions holds the cancellation',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    try:\n        await outbox.relay_forever()\n    except (CancelledError, TimeoutError):\n        await outbox.flush()\n',
        },
      },
      {
        condition: 'a cancellation is suppressed',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    with contextlib.suppress(asyncio.CancelledError):\n        await outbox.relay_forever()\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a cancellation is raised again after its cleanup',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    try:\n        await outbox.relay_forever()\n    except asyncio.CancelledError:\n        await outbox.flush()\n        raise\n',
        },
      },
      {
        condition: 'an ordinary exception is handled',
        files: {
          'src/shop/outbox.py':
            'async def relay(outbox: Outbox) -> None:\n    try:\n        await outbox.relay_forever()\n    except OutboxClosedError:\n        await outbox.flush()\n',
        },
      },
      {
        condition: 'another error is suppressed',
        files: {
          'src/shop/files.py':
            'def remove(path: Path) -> None:\n    with contextlib.suppress(FileNotFoundError):\n        path.unlink()\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'class-name-carries-no-protocol-or-abc-mark',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a protocol carries the I prefix',
        files: {
          'src/shop/payments.py':
            'class IPaymentGateway(Protocol):\n    async def charge(self, amount: Money) -> PaymentId: ...\n',
        },
      },
      {
        condition: 'a protocol carries the Protocol suffix',
        files: {
          'src/shop/orders.py':
            'class OrderRepositoryProtocol(Protocol):\n    async def get(self, order_id: OrderId) -> Order: ...\n',
        },
      },
      {
        condition: 'an abstract class carries the Abstract prefix',
        files: {
          'src/shop/exports.py':
            'class AbstractExporter(ABC):\n    @abstractmethod\n    def export(self) -> bytes: ...\n',
        },
      },
      {
        condition: 'a class built by ABCMeta carries the Base prefix',
        files: {
          'src/shop/exports.py': 'class BaseExporter(metaclass=ABCMeta):\n    pass\n',
        },
      },
      {
        condition: 'a class carries the Type suffix',
        files: {
          'src/shop/orders.py': 'class OrderType(StrEnum):\n    DRAFT = "draft"\n',
        },
      },
      {
        condition: 'a class carries the Interface suffix',
        files: {
          'src/shop/orders.py': 'class ClockInterface:\n    pass\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a port is named for its role',
        files: {
          'src/shop/payments.py':
            'class PaymentGatewayPort(Protocol):\n    async def charge(self, amount: Money) -> PaymentId: ...\n',
        },
      },
      {
        condition: "a concrete class's name opens with a word of capitals",
        files: {
          'src/shop/network.py': 'class IPAddressPool:\n    pass\n',
        },
      },
      {
        condition: "a concrete class's name opens with Base as a word",
        files: {
          'src/shop/pricing.py': 'class BasePrice:\n    pass\n',
        },
      },
      {
        condition: "a class's name ends in lower-case type",
        files: {
          'src/shop/catalog.py': 'class Prototype:\n    pass\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'os-environ-never-changed',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a key of os.environ is assigned',
        files: {
          'src/shop/invoices.py':
            'def bucket(region: str) -> S3Client:\n    os.environ["AWS_DEFAULT_REGION"] = region\n    return boto3.client("s3")\n',
        },
      },
      {
        condition: 'os.environ is updated',
        files: {
          'src/shop/invoices.py': 'def prepare() -> None:\n    os.environ.update({"LANG": "C"})\n',
        },
      },
      {
        condition: 'a key of os.environ is deleted',
        files: {
          'src/shop/invoices.py': 'def prepare() -> None:\n    del os.environ["LANG"]\n',
        },
      },
      {
        condition: 'putenv is called',
        files: {
          'src/shop/invoices.py': 'def prepare() -> None:\n    os.putenv("LANG", "C")\n',
        },
      },
      {
        condition: 'environ imported from os is popped',
        files: {
          'src/shop/invoices.py':
            'from os import environ\n\n\ndef prepare() -> None:\n    environ.pop("LANG")\n',
        },
      },
      {
        condition: 'a session fixture changes the environment',
        files: {
          'tests/conftest.py':
            '@pytest.fixture(scope="session")\ndef region() -> None:\n    os.environ["AWS_DEFAULT_REGION"] = "eu-west-1"\n',
        },
      },
      {
        condition: 'a case changes the environment',
        files: {
          'tests/unit/test_invoices.py':
            'def test_should_upload() -> None:\n    os.environ["AWS_DEFAULT_REGION"] = "eu-west-1"\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the environment is read',
        files: {
          'src/shop/settings.py':
            'def region() -> str | None:\n    return os.environ.get("AWS_DEFAULT_REGION")\n',
        },
      },
      {
        condition: 'a fixture made for each case sets a variable',
        files: {
          'tests/conftest.py':
            '@pytest.fixture\ndef region() -> Iterator[None]:\n    os.environ["AWS_DEFAULT_REGION"] = "eu-west-1"\n    yield\n    del os.environ["AWS_DEFAULT_REGION"]\n',
        },
      },
      {
        condition: "a spec's per-case hook sets a variable",
        files: {
          'tests/unit/test_invoices.py':
            'class TestInvoices:\n    def setup_method(self) -> None:\n        os.environ["AWS_DEFAULT_REGION"] = "eu-west-1"\n',
        },
      },
      {
        condition: 'a copy of the environment is changed',
        files: {
          'src/shop/render.py':
            'def child_env() -> dict[str, str]:\n    env = {"LANG": "C"}\n    env["LC_ALL"] = "C"\n    return env\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'child-process-given-its-own-env',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a process is run with no env',
        files: {
          'src/shop/render.py':
            'def render(html: Path, pdf: Path) -> None:\n    subprocess.run(["/usr/bin/wkhtmltopdf", str(html), str(pdf)], check=True)\n',
        },
      },
      {
        condition: 'a process is given env=None',
        files: {
          'src/shop/render.py':
            'def render() -> None:\n    subprocess.Popen(["/usr/bin/true"], env=None)\n',
        },
      },
      {
        condition: 'a process is given the whole environment',
        files: {
          'src/shop/render.py':
            'def render() -> None:\n    subprocess.run(["/usr/bin/true"], env=os.environ, check=True)\n',
        },
      },
      {
        condition: 'a process is given a copy of the environment with more',
        files: {
          'src/shop/render.py':
            'def render() -> None:\n    subprocess.run(["/usr/bin/true"], env={**os.environ, "LANG": "C"}, check=True)\n',
        },
      },
      {
        condition: 'an async process is started with no env',
        files: {
          'src/shop/render.py':
            'async def render() -> None:\n    await asyncio.create_subprocess_exec("/usr/bin/true")\n',
        },
      },
      {
        condition: 'run imported from subprocess starts a process with no env',
        files: {
          'src/shop/render.py':
            'from subprocess import run\n\n\ndef render() -> None:\n    run(["/usr/bin/true"], check=True)\n',
        },
      },
      {
        condition: 'os.system starts a shell',
        files: {
          'src/shop/render.py': 'def render() -> None:\n    os.system("true")\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a process is given an env built for it',
        files: {
          'src/shop/render.py':
            'def render() -> None:\n    subprocess.run(["/usr/bin/true"], env={"LC_ALL": "C.UTF-8"}, check=True)\n',
        },
      },
      {
        condition: 'a process is given an env a variable holds',
        files: {
          'src/shop/render.py':
            'def render(child_env: Mapping[str, str]) -> None:\n    subprocess.run(["/usr/bin/true"], env=child_env, check=True)\n',
        },
      },
      {
        condition: 'run imported from asyncio runs a coroutine',
        files: {
          'src/shop/main.py':
            'from asyncio import run\n\n\ndef main() -> None:\n    run(serve())\n',
        },
      },
      {
        condition: 'a script outside the source runs a program',
        files: {
          'scripts/release.py':
            'def release() -> None:\n    subprocess.run(["git", "tag", "v1"], check=True)\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'suppression-reason-in-a-second-comment',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a type ignore gives its reason after a dash',
        files: {
          'src/shop/vat.py':
            'import vat_tables  # type: ignore[import-untyped] -- the wheel ships no py.typed\n',
        },
      },
      {
        condition: 'a type ignore gives no reason',
        files: {
          'src/shop/vat.py': 'import vat_tables  # type: ignore[import-untyped]\n',
        },
      },
      {
        condition: "ty's ignore gives its reason in the same comment",
        files: {
          'src/shop/vat.py':
            'import vat_tables  # ty: ignore[unresolved-import] the wheel ships none\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a type ignore gives its reason in a second comment',
        files: {
          'src/shop/vat.py':
            'import vat_tables  # type: ignore[import-untyped]  # the wheel ships no py.typed\n',
        },
      },
      {
        condition: "ty's ignore gives its reason in a second comment",
        files: {
          'src/shop/vat.py':
            'import vat_tables  # ty: ignore[unresolved-import]  # the wheel ships no stubs\n',
        },
      },
      {
        condition: "Ruff's noqa gives its reason after its code",
        files: {
          'src/shop/report.py':
            'def write(report: str) -> None:\n    print(report)  # noqa: T201 Why: the report is the output.\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'duration-measured-by-a-python-monotonic-clock',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a duration is a difference of time.time()',
        files: {
          'src/shop/charge.py':
            'async def charge(payment: Payment) -> None:\n    started = time.time()\n    await gateway.charge(payment)\n    metrics.observe(time.time() - started)\n',
        },
      },
      {
        condition: 'a duration is a difference of two datetime.now() readings',
        files: {
          'src/shop/charge.py':
            'async def charge(payment: Payment) -> None:\n    started = datetime.now(UTC)\n    await gateway.charge(payment)\n    finished = datetime.now(UTC)\n    metrics.observe(finished - started)\n',
        },
      },
      {
        condition: 'a duration is measured from a reading its class kept',
        files: {
          'src/shop/charge.py':
            'class Timer:\n    def __init__(self) -> None:\n        self.started = time.time()\n\n    def elapsed(self) -> float:\n        return time.time() - self.started\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a duration is measured on the monotonic clock',
        files: {
          'src/shop/charge.py':
            'async def charge(payment: Payment) -> None:\n    started = time.monotonic()\n    await gateway.charge(payment)\n    metrics.observe(time.monotonic() - started)\n',
        },
      },
      {
        condition: 'the time left to a deadline is computed',
        files: {
          'src/shop/charge.py':
            'def remaining(expires_at: float) -> float:\n    return expires_at - time.time()\n',
        },
      },
      {
        condition: 'an age is computed from a stored instant',
        files: {
          'src/shop/charge.py':
            'def age(order: Order) -> timedelta:\n    return datetime.now(UTC) - order.placed_at\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'enumeration-is-a-unique-str-enum',
    unit: pythonUnit,
    reported: [
      {
        condition: 'a closed set is a type alias of Literal strings',
        files: {
          'src/shop/payments.py': 'type PaymentMethod = Literal["card", "transfer", "cash"]\n',
        },
      },
      {
        condition: 'a parameter is typed by a union of Literal strings',
        files: {
          'src/shop/payments.py':
            'def pay(method: typing.Literal["card", "cash"]) -> None:\n    pass\n',
        },
      },
      {
        condition: 'a StrEnum is not marked unique',
        files: {
          'src/shop/orders.py':
            'class OrderStatus(StrEnum):\n    DRAFT = "draft"\n    PAID = "paid"\n',
        },
      },
      {
        condition: 'a plain Enum holds strings',
        files: {
          'src/shop/orders.py':
            'class OrderStatus(str, Enum):\n    DRAFT = "draft"\n    PAID = "paid"\n',
        },
      },
      {
        condition: 'a project that follows no architecture types a closed set by Literal strings',
        files: {
          'src/shop/payments.py': 'type PaymentMethod = Literal["card", "cash"]\n',
        },
        unit: {
          axes: [],
          blocks: [],
        },
      },
    ],
    allowed: [
      {
        condition: 'a closed set is a unique StrEnum',
        files: {
          'src/shop/orders.py':
            '@unique\nclass OrderStatus(StrEnum):\n    DRAFT = "draft"\n    PAID = "paid"\n',
        },
      },
      {
        condition: "a sentinel's enumeration holds its one member",
        files: {
          'src/shop/patches.py': 'class NotGiven(Enum):\n    NOT_GIVEN = auto()\n',
        },
      },
      {
        condition: 'a Literal names one value',
        files: {
          'src/shop/payments.py': 'def pay(method: Literal["card"]) -> None:\n    pass\n',
        },
      },
      {
        condition: "a wire model keeps another party's literals",
        files: {
          'src/shop/features/payments/infrastructure/stripe/dtos/charge_dto.py':
            'class ChargeDto(BaseModel):\n    status: Literal["succeeded", "failed"]\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'int-enum-member-number-never-left-to-auto',
    unit: pythonUnit,
    reported: [
      {
        condition: "an IntEnum member's number is left to auto",
        files: {
          'src/shop/declines.py':
            '@unique\nclass DeclineCode(IntEnum):\n    INSUFFICIENT_FUNDS = auto()\n    CARD_EXPIRED = auto()\n',
        },
      },
    ],
    allowed: [
      {
        condition: "an IntEnum member's number is written out",
        files: {
          'src/shop/declines.py':
            '@unique\nclass DeclineCode(IntEnum):\n    INSUFFICIENT_FUNDS = 51\n    CARD_EXPIRED = 54\n',
        },
      },
      {
        condition: "a sentinel's member is left to auto",
        files: {
          'src/shop/patches.py': 'class NotGiven(Enum):\n    NOT_GIVEN = auto()\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'str-enum-member-value-never-left-to-auto',
    unit: pythonUnit,
    reported: [
      {
        condition: "a StrEnum member's value is left to auto",
        files: {
          'src/shop/orders.py':
            '@unique\nclass OrderStatus(StrEnum):\n    DRAFT = auto()\n    PAID = enum.auto()\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a StrEnum member's value is written out",
        files: {
          'src/shop/orders.py':
            '@unique\nclass OrderStatus(StrEnum):\n    DRAFT = "draft"\n    PAID = "paid"\n',
        },
      },
      {
        condition: "a sentinel's member is left to auto",
        files: {
          'src/shop/patches.py': 'class NotGiven(Enum):\n    NOT_GIVEN = auto()\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'app-assembled-by-the-root',
    unit: {
      blocks: [
        'fastapi',
      ],
    },
    reported: [
      {
        condition: "a feature's presentation builds the app",
        files: {
          'src/shop/features/orders/presentation/routes.py':
            'app = FastAPI(lifespan=orders_lifespan)\n',
        },
      },
      {
        condition: 'the entry file builds the app through its module',
        files: {
          'src/shop/main.py': 'app = fastapi.FastAPI()\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the composition root builds the app',
        files: {
          'src/shop/root/app.py':
            'def build_app(config: Config) -> FastAPI:\n    app = FastAPI(lifespan=build_lifespan(config))\n    app.include_router(build_orders_router(config))\n    return app\n',
        },
      },
      {
        condition: 'a spec builds an app around a router',
        files: {
          'tests/unit/test_routes.py':
            'def test_should_show_the_order() -> None:\n    app = FastAPI()\n    assert app\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'routers-built-by-a-function-the-root-calls',
    unit: {
      blocks: [
        'fastapi',
      ],
    },
    reported: [
      {
        condition: 'a route is decorated as its module loads',
        files: {
          'src/shop/features/orders/presentation/routes.py':
            'from fastapi import APIRouter\n\nrouter = APIRouter(prefix="/orders")\n\n\n@router.get("/{order_id}")\nasync def show_order(order_id: OrderId) -> OrderView:\n    return await get_order(order_id)\n',
        },
      },
      {
        condition: 'a router built in the module takes a route with no fastapi import',
        files: {
          'src/shop/features/orders/presentation/routes.py':
            'router = fastapi.APIRouter()\n\n\n@router.post("/")\nasync def place() -> None:\n    pass\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'routes are declared inside the function that builds the router',
        files: {
          'src/shop/features/orders/presentation/routes.py':
            'from fastapi import APIRouter\n\n\ndef build_orders_router(context: OrdersContext) -> APIRouter:\n    router = APIRouter(prefix="/orders")\n\n    @router.get("/{order_id}")\n    async def show_order(order_id: OrderId) -> OrderView:\n        return await context.get_order(order_id)\n\n    return router\n',
        },
      },
      {
        condition: "another library's get decorator sits in a module that reaches no FastAPI",
        files: {
          'src/shop/cache.py':
            '@registry.get("orders")\ndef orders() -> list[Order]:\n    return []\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'tools-built-by-a-function-the-root-calls',
    unit: {
      blocks: [
        'fastmcp',
      ],
    },
    reported: [
      {
        condition: 'a tool is decorated onto a server its module builds',
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'orders_server = FastMCP(name="orders")\n\n\n@orders_server.tool\nasync def find_orders(customer_id: CustomerId) -> tuple[OrderSummary, ...]:\n    return await find_open_orders(customer_id)\n',
        },
      },
      {
        condition: 'a tool is decorated with options onto an imported server',
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'from fastmcp import Context\n\nfrom .server import mcp\n\n\n@mcp.tool(name="find_orders")\nasync def find_orders(context: Context) -> None:\n    pass\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'tools are built inside the function that builds the server',
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'def build_orders_server(context: OrdersContext) -> FastMCP:\n    orders_server = FastMCP(name="orders")\n\n    @orders_server.tool\n    async def find_orders(customer_id: CustomerId) -> tuple[OrderSummary, ...]:\n        return await context.find_orders(customer_id)\n\n    return orders_server\n',
        },
      },
      {
        condition: "another library's tool decorator sits in a module that reaches no fastmcp",
        files: {
          'src/shop/agents.py':
            '@agent.tool\ndef order_count(context: RunContext[Deps]) -> int:\n    return 0\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'program-raises-no-tool-error',
    unit: {
      blocks: [
        'fastmcp',
      ],
    },
    reported: [
      {
        condition: 'a ToolError is raised',
        files: {
          'src/shop/features/orders/application/cancel.py':
            'async def cancel(order_id: OrderId) -> None:\n    raise ToolError(f"Order {order_id} not found")\n',
        },
      },
      {
        condition: "fastmcp's ToolError is raised through its module",
        files: {
          'src/shop/tools.py':
            'def refuse() -> None:\n    raise fastmcp.exceptions.ToolError("refused") from None\n',
        },
      },
    ],
    allowed: [
      {
        condition: "the error library's error is raised",
        files: {
          'src/shop/features/orders/application/cancel.py':
            'async def cancel(order_id: OrderId) -> None:\n    raise OrderNotFoundError(order_id)\n',
        },
      },
      {
        condition: 'a ToolError another server answered is caught',
        files: {
          'src/shop/client.py':
            'async def call(client: Client) -> None:\n    try:\n        await client.call_tool("find")\n    except ToolError as error:\n        raise LookupFailedError() from error\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'tool-defect-masked-by-mask-error-details',
    unit: {
      blocks: [
        'fastmcp',
      ],
    },
    reported: [
      {
        condition: 'the root builds the server without masking',
        files: {
          'src/shop/root/server.py':
            'def build_server(context: ShopContext) -> FastMCP:\n    server = FastMCP(name="shop")\n    server.mount(build_orders_server(context.orders))\n    return server\n',
        },
      },
      {
        condition: 'the server masks nothing',
        files: {
          'src/shop/root/server.py':
            'def build_server() -> FastMCP:\n    return fastmcp.FastMCP(name="shop", mask_error_details=False)\n',
        },
      },
      {
        condition: 'a project that follows no architecture builds its server without masking',
        files: {
          'src/shop/server.py': 'server = FastMCP(name="shop")\n',
        },
        unit: {
          axes: [],
          blocks: [
            'fastmcp',
          ],
        },
      },
      {
        condition: 'a presentation builds the server the root mounts without masking',
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'def build_orders_server(context: OrdersContext) -> FastMCP:\n    return FastMCP(name="orders")\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the root builds the server with masking',
        files: {
          'src/shop/root/server.py':
            'def build_server(context: ShopContext) -> FastMCP:\n    server = FastMCP(name="shop", mask_error_details=True)\n    server.mount(build_orders_server(context.orders))\n    return server\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'parameter-described-by-its-field',
    unit: {
      blocks: [
        'fastmcp',
      ],
    },
    reported: [
      {
        condition: "a tool's parameters carry no description",
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'def build_orders_server(context: OrdersContext) -> FastMCP:\n    server = FastMCP(name="orders")\n\n    @server.tool\n    async def refund_order(order_id: str, amount: int) -> Refund:\n        return await context.refund_order(order_id, amount)\n\n    return server\n',
        },
      },
      {
        condition: "a tool's parameter is described by a default Field",
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'def register(server: FastMCP) -> None:\n    @server.tool()\n    async def refund_order(order_id: str = Field(description="The order")) -> Refund:\n        return Refund()\n',
        },
      },
      {
        condition: "a tool's parameter is annotated with a bare string",
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'def build_orders_server() -> FastMCP:\n    server = FastMCP(name="orders")\n\n    @server.tool\n    async def refund_order(order_id: Annotated[str, "The order"]) -> Refund:\n        return Refund()\n\n    return server\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a tool's parameters are described by their Field",
        files: {
          'src/shop/features/orders/presentation/tools.py':
            'def build_orders_server(context: OrdersContext) -> FastMCP:\n    server = FastMCP(name="orders")\n\n    @server.tool\n    async def refund_order(\n        order_id: Annotated[str, Field(description="The order\'s id")],\n        amount: Annotated[int, Field(description="In cents", ge=1)],\n        ctx: Context,\n    ) -> Refund:\n        return await context.refund_order(order_id, amount)\n\n    return server\n',
        },
      },
      {
        condition: "another library's tool takes undescribed parameters",
        files: {
          'src/shop/agents.py':
            'def build_agent() -> Agent:\n    agent = Agent(model="test")\n\n    @agent.tool\n    def order_count(context: RunContext[Deps], customer_id: str) -> int:\n        return 0\n\n    return agent\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'client-built-with-its-own-timeout',
    unit: {
      blocks: [
        'httpx2',
      ],
    },
    reported: [
      {
        condition: 'a client is built with no timeout',
        files: {
          'src/shop/root/run.py':
            'async def run(config: Config) -> None:\n    async with httpx2.AsyncClient(base_url=config.payments_url) as client:\n        await serve(client)\n',
        },
      },
      {
        condition: 'a client is built with timeout=None',
        files: {
          'src/shop/root/run.py':
            'async def run(config: Config) -> None:\n    async with httpx2.AsyncClient(timeout=None) as client:\n        await serve(client)\n',
        },
      },
      {
        condition: 'a client imported by name takes a bare number',
        files: {
          'src/shop/root/run.py':
            'from httpx2 import Client\n\n\ndef run() -> None:\n    with Client(timeout=5.0) as client:\n        serve(client)\n',
        },
      },
      {
        condition: 'a call passes timeout=None',
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'import httpx2\n\n\nasync def charge(client: httpx2.AsyncClient) -> None:\n    await client.post("/charges", timeout=None)\n',
        },
      },
      {
        condition: 'a Timeout turns its read limit off',
        files: {
          'src/shop/root/run.py': 'PAYMENTS_TIMEOUT = httpx2.Timeout(3.0, read=None)\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a client is built with a Timeout of its own',
        files: {
          'src/shop/root/run.py':
            'PAYMENTS_TIMEOUT = httpx2.Timeout(3.0, connect=1.0)\n\n\nasync def run(config: Config) -> None:\n    async with httpx2.AsyncClient(base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT) as client:\n        await serve(client)\n',
        },
      },
      {
        condition: 'a call passes a Timeout of its own',
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'import httpx2\n\n\nasync def charge(client: httpx2.AsyncClient) -> None:\n    await client.post("/charges", timeout=LONG_TIMEOUT)\n',
        },
      },
      {
        condition: "a queue's get waits without end in a module that reaches no httpx2",
        files: {
          'src/shop/workers.py':
            'def take(jobs: Queue) -> Job:\n    return jobs.get(timeout=None)\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'client-open-for-the-program-life',
    unit: {
      blocks: [
        'httpx2',
      ],
    },
    reported: [
      {
        condition: 'a client is bound to a name and closed by hand',
        files: {
          'src/shop/root/run.py':
            'async def run(config: Config) -> None:\n    client = httpx2.AsyncClient(timeout=PAYMENTS_TIMEOUT)\n    await serve(client)\n    await client.aclose()\n',
        },
      },
      {
        condition: 'an adapter builds its own client',
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'class PaymentsAdapter:\n    def __init__(self) -> None:\n        self._client = httpx2.AsyncClient(timeout=PAYMENTS_TIMEOUT)\n',
        },
      },
      {
        condition: 'a client is handed to an adapter as it is built',
        files: {
          'src/shop/root/run.py':
            'from httpx2 import AsyncClient\n\n\ndef build() -> PaymentsAdapter:\n    return PaymentsAdapter(AsyncClient(timeout=PAYMENTS_TIMEOUT))\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a client is opened by async with',
        files: {
          'src/shop/root/run.py':
            'async def run(config: Config) -> None:\n    async with httpx2.AsyncClient(timeout=PAYMENTS_TIMEOUT) as client:\n        await serve(client)\n',
        },
      },
      {
        condition: 'a client is entered on the stack of the run',
        files: {
          'src/shop/root/run.py':
            'async def run(stack: AsyncExitStack) -> None:\n    client = await stack.enter_async_context(httpx2.AsyncClient(timeout=PAYMENTS_TIMEOUT))\n    await serve(client)\n',
        },
      },
      {
        condition: 'a factory returns the client its caller opens',
        files: {
          'src/shop/root/clients.py':
            'def payments_client(config: Config) -> httpx2.AsyncClient:\n    return httpx2.AsyncClient(base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT)\n',
        },
      },
      {
        condition: 'a client bound to a name is opened by with',
        files: {
          'src/shop/root/run.py':
            'def run() -> None:\n    client = httpx2.Client(timeout=PAYMENTS_TIMEOUT)\n    with client:\n        serve(client)\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'response-body-parsed-from-its-bytes',
    unit: {
      blocks: [
        'httpx2',
      ],
    },
    reported: [
      {
        condition: "a response's body is read by json()",
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'import httpx2\n\n\nasync def charge(self, amount: Cents) -> PaymentReference:\n    response = await self._client.post("/charges", json={"amount": amount})\n    response.raise_for_status()\n    return PaymentReference(response.json()["reference"])\n',
        },
      },
      {
        condition: 'an awaited request is read by json() at once',
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'import httpx2\n\n\nasync def status(self) -> Status:\n    return Status((await self._client.get("/status")).json())\n',
        },
      },
      {
        condition: "a response's text is parsed",
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'import httpx2\n\n\nasync def charge(self) -> PaymentReference:\n    response = await self._client.post("/charges")\n    return ChargeAnswer.model_validate_json(response.text).reference\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a response's bytes are parsed by its schema",
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'async def charge(self, amount: Cents) -> PaymentReference:\n    response = await self._client.post("/charges", json={"amount": amount})\n    response.raise_for_status()\n    return ChargeAnswer.model_validate_json(response.content).reference\n',
        },
      },
      {
        condition: "a response's text is logged",
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'async def charge(self) -> None:\n    response = await self._client.post("/charges")\n    _logger.info("charge refused", extra={"body": response.text})\n',
        },
      },
      {
        condition: "a repository's get is read by json() in a module that takes no httpx2",
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'def stored(self, key: str) -> Stored:\n    return Stored(self._repository.get(key).json())\n',
        },
      },
      {
        condition: 'a model is serialised by its own json method',
        files: {
          'src/shop/infrastructure/payments/payments_adapter.py':
            'def body(charge: ChargeDto) -> str:\n    return charge.model_dump_json()\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'ruff-suppression-written-on-its-line',
    unit: {
      blocks: [
        'ruff',
      ],
    },
    reported: [
      {
        condition: 'a bare noqa silences every rule on its line',
        files: {
          'src/shop/report.py': 'def write(report: str) -> None:\n    print(report)  # noqa\n',
        },
      },
      {
        condition: 'a noqa names two codes',
        files: {
          'src/shop/report.py':
            'def write(report: str) -> None:\n    print(report)  # noqa: T201, E501 Why: the output.\n',
        },
      },
      {
        condition: 'a range disables a rule',
        files: {
          'src/shop/report.py':
            '# ruff: disable[T201]\ndef write(report: str) -> None:\n    print(report)\n',
        },
      },
      {
        condition: 'a file-level noqa names a code',
        files: {
          'src/shop/report.py':
            '# ruff: noqa: T201 Why: the report is the output.\ndef write(report: str) -> None:\n    print(report)\n',
        },
      },
      {
        condition: "flake8's file-level noqa is written",
        files: {
          'src/shop/report.py': '# flake8: noqa\nVALUE = 1\n',
        },
      },
      {
        condition: 'a file-ignore is written',
        files: {
          'src/shop/report.py': '# ruff: file-ignore[T201]\nVALUE = 1\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a noqa names one code on its line',
        files: {
          'src/shop/report.py':
            'def write(report: str) -> None:\n    print(report)  # noqa: T201 Why: the report is the output.\n',
        },
      },
      {
        condition: "Ruff's ignore names one code on the line above",
        files: {
          'src/shop/report.py':
            'def write(report: str) -> None:\n    # ruff: ignore[T201] Why: the report is the output.\n    print(report)\n',
        },
      },
      {
        condition: "a noqa's reason names a version",
        files: {
          'src/shop/report.py':
            'def write(report: str) -> None:\n    print(report)  # noqa: T201 py3 writes the report to stdout.\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'other-partys-shape-model-ignores-extra',
    unit: {
      blocks: [
        'schema/pydantic',
      ],
    },
    reported: [
      {
        condition: "a wire model of another party's shape forbids extra keys",
        files: {
          'src/shop/features/payments/infrastructure/stripe/dtos/charge_dto.py':
            'class StripeChargeDto(BaseModel):\n    model_config = ConfigDict(extra="forbid", frozen=True)\n\n    id: str\n',
        },
      },
      {
        condition: 'a wire model forbids extra keys in its class arguments',
        files: {
          'src/shop/features/payments/infrastructure/stripe/charge_dto.py':
            'class StripeChargeDto(BaseModel, extra="forbid"):\n    id: str\n',
        },
      },
      {
        condition: 'a wire model forbids extra keys in a dictionary',
        files: {
          'src/shop/features/payments/infrastructure/stripe/dtos/charge_dto.py':
            'class StripeChargeDto(BaseModel):\n    model_config = {"extra": "forbid"}\n',
        },
      },
      {
        condition:
          "a project that follows no architecture forbids extra keys in a wire model's file",
        files: {
          'src/shop/stripe/charge_dto.py':
            'class StripeChargeDto(BaseModel, extra="forbid"):\n    id: str\n',
        },
        unit: {
          axes: [],
          blocks: [
            'schema/pydantic',
          ],
        },
      },
    ],
    allowed: [
      {
        condition: 'a wire model ignores extra keys',
        files: {
          'src/shop/features/payments/infrastructure/stripe/dtos/charge_dto.py':
            'class StripeChargeDto(BaseModel):\n    model_config = ConfigDict(extra="ignore", frozen=True)\n\n    id: str\n',
        },
      },
      {
        condition: "a model of the program's own shape forbids extra keys",
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_body.py':
            'class PlaceOrderBody(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'settings-model-keeps-extra-forbidden',
    unit: {
      blocks: [
        'deployment',
        'schema/pydantic',
      ],
    },
    reported: [
      {
        condition: 'a settings model ignores extra keys',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix="SHOP_", extra="ignore", frozen=True)\n\n    database_url: PostgresDsn\n',
        },
      },
      {
        condition: 'a settings model allows extra keys in its class arguments',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(pydantic_settings.BaseSettings, extra="allow"):\n    database_url: PostgresDsn\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a settings model keeps its default',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix="SHOP_", frozen=True)\n\n    database_url: PostgresDsn\n',
        },
      },
      {
        condition: 'a settings model forbids extra keys in so many words',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix="SHOP_", extra="forbid")\n',
        },
      },
      {
        condition: 'a model that reads no settings ignores extra keys',
        files: {
          'src/shop/features/payments/infrastructure/stripe/dtos/charge_dto.py':
            'class ChargeDto(BaseModel):\n    model_config = ConfigDict(extra="ignore")\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'settings-model-sets-an-env-prefix',
    unit: {
      blocks: [
        'deployment',
        'schema/pydantic',
      ],
    },
    reported: [
      {
        condition: 'a settings model sets no prefix',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(frozen=True)\n\n    database_url: PostgresDsn\n',
        },
      },
      {
        condition: 'a settings model has no configuration',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    database_url: PostgresDsn\n',
        },
      },
      {
        condition: 'a settings model sets an empty prefix',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix="")\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a settings model sets its prefix',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix="SHOP_", frozen=True)\n\n    database_url: PostgresDsn\n',
        },
      },
      {
        condition: 'a settings model sets its prefix in its class arguments',
        files: {
          'src/shop/root/config/settings.py':
            'class Settings(BaseSettings, env_prefix="SHOP_"):\n    database_url: PostgresDsn\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'structlog-configured-by-the-root',
    unit: {
      blocks: [
        'structlog',
      ],
    },
    reported: [
      {
        condition: 'an adapter adds a handler to its logger',
        files: {
          'src/shop/features/payments/infrastructure/stripe/payment_gateway_adapter.py':
            'logger = logging.getLogger(__name__)\nlogger.addHandler(logging.StreamHandler())\n',
        },
      },
      {
        condition: 'a module calls basicConfig',
        files: {
          'src/shop/libs/stripe/stripe_client.py': 'logging.basicConfig(level=logging.INFO)\n',
        },
      },
      {
        condition: 'the entry file configures structlog',
        files: {
          'src/shop/main.py': 'structlog.configure(processors=[])\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the composition root configures structlog and the handler',
        files: {
          'src/shop/root/logging.py':
            'def configure_logging(settings: LoggingSettings) -> None:\n    structlog.configure(processors=[], logger_factory=LoggerFactory())\n    logging.getLogger().addHandler(build_handler(settings))\n',
        },
      },
      {
        condition: 'a module gets its logger',
        files: {
          'src/shop/features/payments/infrastructure/stripe/payment_gateway_adapter.py':
            'logger = logging.getLogger(__name__)\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'extra-field-named-apart-from-record-attributes',
    unit: {
      blocks: [
        'structlog',
      ],
    },
    reported: [
      {
        condition: 'an extra field is named like a record attribute',
        files: {
          'src/shop/cart.py':
            'def add(product: Product, quantity: int) -> None:\n    logger.info("product added", extra={"name": product.name, "quantity": quantity})\n',
        },
      },
      {
        condition: "an extra field built by dict takes message's name",
        files: {
          'src/shop/cart.py':
            'def add(product: Product) -> None:\n    logger.warning("product added", extra=dict(message=product.name))\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the extra fields are named apart from the record attributes',
        files: {
          'src/shop/cart.py':
            'def add(product: Product, quantity: int) -> None:\n    logger.info("product added", extra={"product_name": product.name, "quantity": quantity})\n',
        },
      },
      {
        condition: 'a call that is no log call passes extra a name',
        files: {
          'src/shop/cart.py':
            'def add(product: Product) -> None:\n    catalog.record(extra={"name": product.name})\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'uvicorn-wait-bounded-by-timeout-graceful-shutdown',
    unit: {
      blocks: [
        'uvicorn',
      ],
    },
    reported: [
      {
        condition: 'the config leaves the graceful wait unbounded',
        files: {
          'src/shop/root/serve.py':
            'config = uvicorn.Config(app, host=settings.host, port=settings.port, log_config=None)\n',
        },
      },
      {
        condition: 'the config sets the graceful wait to None',
        files: {
          'src/shop/root/serve.py':
            'from uvicorn import Config\n\nconfig = Config(app, timeout_graceful_shutdown=None, log_config=None)\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the config bounds the graceful wait',
        files: {
          'src/shop/root/serve.py':
            'config = uvicorn.Config(\n    app,\n    log_config=None,\n    timeout_graceful_shutdown=settings.graceful_shutdown_seconds,\n)\n',
        },
      },
      {
        condition: "another library's Config is built",
        files: {
          'src/shop/root/serve.py': 'config = Config(path="shop.toml")\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'uvicorn-records-join-the-pipeline',
    unit: {
      blocks: [
        'observability',
        'uvicorn',
      ],
    },
    reported: [
      {
        condition: "the config keeps uvicorn's own logging",
        files: {
          'src/shop/root/serve.py':
            'config = uvicorn.Config(app, timeout_graceful_shutdown=settings.graceful_shutdown_seconds)\n',
        },
      },
      {
        condition: 'run is handed a logging config of its own',
        files: {
          'src/shop/root/serve.py':
            'from uvicorn import run\n\nrun(app, log_config=LOGGING, timeout_graceful_shutdown=5)\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the config sets log_config to None',
        files: {
          'src/shop/root/serve.py':
            'config = uvicorn.Config(\n    app,\n    log_config=None,\n    timeout_graceful_shutdown=settings.graceful_shutdown_seconds,\n)\n',
        },
      },
      {
        condition: "asyncio's run starts the program",
        files: {
          'src/shop/main.py': 'from asyncio import run\n\nrun(main())\n',
        },
      },
    ],
  },
];

export { pythonPluginRows };
