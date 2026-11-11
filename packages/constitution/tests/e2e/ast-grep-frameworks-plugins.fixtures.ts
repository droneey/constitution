import type { PluginRow } from './ast-grep-plugins.fixtures';

const nestjsRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'use-filters-never-written',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'a controller binds a filter of its own',
        files: {
          'src/features/orders/presentation/bindings/orders.controller.ts':
            "import { Controller, UseFilters } from '@nestjs/common';\n\n@Controller('orders')\n@UseFilters(OrderErrorsFilter)\nexport class OrdersController {}\n",
        },
      },
      {
        condition: 'a method binds a filter of its own',
        files: {
          'src/features/orders/presentation/bindings/orders.controller.ts':
            "import { Controller, Get, UseFilters } from '@nestjs/common';\n\n@Controller('orders')\nexport class OrdersController {\n  @Get()\n  @UseFilters(OrderErrorsFilter)\n  list() {\n    return [];\n  }\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a controller leaves its failures to the global filter',
        files: {
          'src/features/orders/presentation/bindings/orders.controller.ts':
            "import { Controller } from '@nestjs/common';\n\n@Controller('orders')\nexport class OrdersController {}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'global-guard-registered-as-app-guard',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'the app binds a global guard by useGlobalGuards',
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\n\nconst app = await NestFactory.create(RootModule);\n\napp.useGlobalGuards(new SessionGuard());\n",
        },
      },
    ],
    allowed: [
      {
        condition: "the root's module registers the guard as APP_GUARD",
        files: {
          'src/root/root.module.ts':
            "import { Module } from '@nestjs/common';\nimport { APP_GUARD } from '@nestjs/core';\n\n@Module({\n  providers: [{ provide: APP_GUARD, useClass: SessionGuard }],\n})\nexport class RootModule {}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'global-module-never-declared',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'a module of the program is declared global',
        files: {
          'src/features/orders/presentation/module/clock.module.ts':
            "import { Global, Module } from '@nestjs/common';\n\n@Global()\n@Module({ exports: [CLOCK] })\nexport class ClockModule {}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a module is imported where it is needed',
        files: {
          'src/features/orders/presentation/module/clock.module.ts':
            "import { Module } from '@nestjs/common';\n\n@Module({ exports: [CLOCK] })\nexport class ClockModule {}\n",
        },
      },
      {
        condition: "the root's module imports a library's global module",
        files: {
          'src/root/root.module.ts':
            "import { Module } from '@nestjs/common';\nimport { LoggerModule } from 'nestjs-pino';\n\n@Module({ imports: [LoggerModule.forRoot()] })\nexport class RootModule {}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'guard-or-filter-never-filed-as-a-provider',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'an exception filter sits among the providers',
        files: {
          'src/presentation/providers/errors.providers.ts':
            "import { Catch } from '@nestjs/common';\n\n@Catch()\nexport class ErrorsFilter {}\n",
        },
      },
      {
        condition: 'a guard sits among the providers',
        files: {
          'src/presentation/providers/session.providers.ts':
            "import type { CanActivate } from '@nestjs/common';\n\nexport class SessionGuard implements CanActivate {\n  canActivate() {\n    return true;\n  }\n}\n",
        },
      },
      {
        condition: 'a typed exception filter sits among the providers',
        files: {
          'src/presentation/providers/errors.providers.ts':
            "import type { ExceptionFilter } from '@nestjs/common';\n\nexport class ErrorsFilter implements ExceptionFilter<OrderError> {\n  catch() {}\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the guard and the filter sit in the bindings',
        files: {
          'src/presentation/bindings/session.guard.ts':
            "import type { CanActivate } from '@nestjs/common';\n\nexport class SessionGuard implements CanActivate {\n  canActivate() {\n    return true;\n  }\n}\n",
          'src/presentation/bindings/errors.filter.ts':
            "import { Catch } from '@nestjs/common';\n\n@Catch()\nexport class ErrorsFilter {}\n",
        },
      },
      {
        condition: 'an interceptor sits among the providers',
        files: {
          'src/presentation/providers/timing.interceptor.ts':
            "import type { NestInterceptor } from '@nestjs/common';\n\nexport class TimingInterceptor implements NestInterceptor {\n  intercept() {}\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nest-controller-carries-the-controller-suffix',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'a controller sits in a file without the suffix',
        files: {
          'src/features/orders/presentation/bindings/orders.ts':
            "import { Controller } from '@nestjs/common';\n\n@Controller('orders')\nexport class OrdersController {}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a controller sits in its controller file',
        files: {
          'src/features/orders/presentation/bindings/orders.controller.ts':
            "import { Controller } from '@nestjs/common';\n\n@Controller('orders')\nexport class OrdersController {}\n",
        },
      },
      {
        condition: 'a spec declares a controller of its own',
        files: {
          'src/features/orders/presentation/bindings/__tests__/orders.controller.test.ts':
            "import { Controller } from '@nestjs/common';\n\n@Controller('probe')\nclass ProbeController {}\n\nexport { ProbeController };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nest-module-sits-in-the-presentation-it-serves',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: "a feature's module sits beside its layers",
        files: {
          'src/features/orders/orders.module.ts':
            "import { Module } from '@nestjs/common';\n\n@Module({})\nexport class OrdersModule {}\n",
        },
      },
      {
        condition: 'a module sits among the root files other than its module',
        files: {
          'src/root/orders-adapters.module.ts':
            "import { Module } from '@nestjs/common';\n\n@Module({})\nexport class OrdersAdaptersModule {}\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a feature's module sits in its presentation's module folder",
        files: {
          'src/features/orders/presentation/module/orders.module.ts':
            "import { Module } from '@nestjs/common';\n\n@Module({})\nexport class OrdersModule {}\n",
        },
      },
      {
        condition: "the root's module sits in the root",
        files: {
          'src/root/root.module.ts':
            "import { Module } from '@nestjs/common';\n\n@Module({ imports: [] })\nexport class RootModule {}\n",
        },
      },
      {
        condition: "the program's presentation holds its module",
        files: {
          'src/presentation/module/presentation.module.ts':
            "import { Module } from '@nestjs/common';\n\n@Module({})\nexport class PresentationModule {}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'providers-folder-holds-only-providers',
    unit: {
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'a use case sits among the providers',
        files: {
          'src/features/orders/presentation/providers/place-order.use-case.ts':
            'export const createPlaceOrder = () => () => undefined;\n',
        },
      },
      {
        condition: 'a guard sits among the providers',
        files: {
          'src/presentation/providers/session.guard.ts': 'export class SessionGuard {}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the folder holds providers, a pipe, an interceptor and its surface',
        files: {
          'src/features/orders/presentation/providers/orders.providers.ts':
            'export const ordersProviders = [];\n',
          'src/features/orders/presentation/providers/order-id.pipe.ts':
            'export class OrderIdPipe {}\n',
          'src/features/orders/presentation/providers/timing.interceptor.ts':
            'export class TimingInterceptor {}\n',
          'src/features/orders/presentation/providers/index.ts':
            "export { ordersProviders } from './orders.providers';\n",
        },
      },
      {
        condition: "a provider's spec sits in the folder of specs beside it",
        files: {
          'src/features/orders/presentation/providers/__tests__/order-id.pipe.test.ts':
            "import { expect, it } from 'bun:test';\n\nit('should hold', () => {\n  // Assert\n  expect(1).toBe(1);\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nest-http-exception-never-thrown',
    unit: {
      axes: [],
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: "code throws one of Nest's exceptions",
        files: {
          'src/orders/ensure-order-found.ts':
            "import { NotFoundException } from '@nestjs/common';\n\nexport const ensureOrderFound = (order?: string): string => {\n  if (order === undefined) {\n    throw new NotFoundException('order not found');\n  }\n\n  return order;\n};\n",
        },
      },
      {
        condition: 'code throws an HttpException',
        files: {
          'src/orders/ensure-order-found.ts':
            "import { HttpException } from '@nestjs/common';\n\nexport const refuse = (): never => {\n  throw new HttpException('gone', 410);\n};\n",
        },
      },
      {
        condition: "an error of the program extends one of Nest's exceptions",
        files: {
          'src/orders/order-not-found.error.ts':
            "import { NotFoundException } from '@nestjs/common';\n\nexport class OrderNotFoundError extends NotFoundException {}\n",
        },
      },
      {
        condition: "a promise is rejected with one of Nest's exceptions",
        files: {
          'src/orders/ensure-order-found.ts':
            "import { ConflictException } from '@nestjs/common';\n\nexport const refuse = (): Promise<never> => Promise.reject(new ConflictException());\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'code throws an error of its own library',
        files: {
          'src/orders/ensure-order-found.ts':
            "import { Injectable } from '@nestjs/common';\n\nexport const ensureOrderFound = (order?: string): string => {\n  if (order === undefined) {\n    throw new OrderNotFoundError();\n  }\n\n  return order;\n};\n\nexport { Injectable };\n",
        },
      },
      {
        condition: "a module of the program's own names an error as Nest names one",
        files: {
          'src/orders/ensure-order-found.ts':
            "import { NotFoundException } from './errors';\n\nexport const refuse = (): never => {\n  throw new NotFoundException();\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nest-shutdown-hooks-enabled',
    unit: {
      axes: [],
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'the entry file starts the app without its shutdown hooks',
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\n\nconst app = await NestFactory.create(RootModule);\n\nawait app.listen(3000);\n",
        },
      },
      {
        condition: 'a worker builds an application context without its shutdown hooks',
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\n\nconst context = await NestFactory.createApplicationContext(WorkerModule);\n\nawait context.init();\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the entry file enables the shutdown hooks',
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\n\nconst app = await NestFactory.create(RootModule);\n\napp.enableShutdownHooks();\nawait app.listen(3000);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nest-app-closed-inside-its-case',
    unit: {
      axes: [],
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: 'the app is built in a hook before all cases',
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { beforeAll, expect, test } from 'bun:test';\nimport { Test } from '@nestjs/testing';\n\nlet app: App;\n\nbeforeAll(async () => {\n  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();\n  app = moduleRef.createNestApplication();\n  await app.init();\n});\n\ntest('should list the orders', async () => {\n  // Act\n  const response = await app.inject('/orders');\n\n  // Assert\n  expect(response.status).toBe(200);\n});\n",
        },
      },
      {
        condition: 'the app is closed in a hook after all cases',
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { afterAll, expect, test } from 'bun:test';\nimport { Test } from '@nestjs/testing';\n\nconst apps: App[] = [];\n\nafterAll(async () => {\n  await apps[0]?.close();\n});\n\ntest('should list the orders', async () => {\n  // Arrange\n  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();\n  const app = moduleRef.createNestApplication();\n\n  apps.push(app);\n  await app.init();\n\n  // Act\n  const response = await app.inject('/orders');\n\n  // Assert\n  expect(response.status).toBe(200);\n});\n",
        },
      },
      {
        condition: 'a case builds the app and never closes it',
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { expect, test } from 'bun:test';\nimport { Test } from '@nestjs/testing';\n\ntest('should list the orders', async () => {\n  // Arrange\n  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();\n  const app = moduleRef.createNestApplication();\n\n  await app.init();\n\n  // Act\n  const response = await app.inject('/orders');\n\n  // Assert\n  expect(response.status).toBe(200);\n});\n",
        },
      },
      {
        condition: 'the testing module is built at the top of the file',
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { expect, test } from 'bun:test';\nimport { Test } from '@nestjs/testing';\n\nconst moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();\n\ntest('should build the app', () => {\n  // Assert\n  expect(moduleRef).toBeDefined();\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case builds, inits and closes its app',
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { expect, test } from 'bun:test';\nimport { Test } from '@nestjs/testing';\n\ntest('should list the orders', async () => {\n  // Arrange\n  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();\n  const nest = moduleRef.createNestApplication();\n  await using app = Object.assign(nest, { [Symbol.asyncDispose]: () => nest.close() });\n\n  await app.init();\n\n  // Act\n  const response = await app.inject('/orders');\n\n  // Assert\n  expect(response.status).toBe(200);\n});\n",
        },
      },
      {
        condition: 'a case builds its app through a helper of the spec',
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { expect, test } from 'bun:test';\nimport { Test } from '@nestjs/testing';\n\nconst moduleOf = () => Test.createTestingModule({ imports: [RootModule] }).compile();\n\ntest('should list the orders', async () => {\n  // Arrange\n  const app = (await moduleOf()).createNestApplication();\n\n  await app.init();\n\n  // Act\n  const response = await app.inject('/orders');\n\n  // Assert\n  expect(response.status).toBe(200);\n  await app.close();\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'nest-spec-endpoint-left-to-the-system',
    unit: {
      axes: [],
      blocks: [
        'nestjs',
      ],
    },
    reported: [
      {
        condition: "a spec's app listens on a fixed port",
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { Test } from '@nestjs/testing';\n\nexport const start = async (app: App): Promise<void> => {\n  await app.listen(3000);\n};\n\nexport { Test };\n",
        },
      },
      {
        condition: "a spec's app listens on every interface",
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { Test } from '@nestjs/testing';\n\nexport const start = async (app: App): Promise<void> => {\n  await app.listen(0);\n};\n\nexport { Test };\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a spec's app takes a port the system chooses on the loopback",
        files: {
          'src/orders/__tests__/orders.e2e.test.ts':
            "import { Test } from '@nestjs/testing';\n\nexport const start = async (app: App): Promise<void> => {\n  await app.listen(0, '127.0.0.1');\n};\n\nexport { Test };\n",
        },
      },
      {
        condition: 'the entry file listens on its configured port',
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\n\nconst app = await NestFactory.create(RootModule);\n\napp.enableShutdownHooks();\nawait app.listen(3000);\n",
        },
      },
    ],
  },
];

const pinoRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'nest-logs-through-the-pino-instance',
    unit: {
      axes: [],
      blocks: [
        'nestjs',
        'pino',
      ],
    },
    reported: [
      {
        condition: 'the app starts without buffering its logs',
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\nimport { Logger } from 'nestjs-pino';\n\nconst app = await NestFactory.create(RootModule);\n\napp.useLogger(app.get(Logger));\napp.enableShutdownHooks();\n",
        },
      },
      {
        condition: "the app never makes the pino logger Nest's own",
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\n\nconst app = await NestFactory.create(RootModule, { bufferLogs: true });\n\napp.enableShutdownHooks();\n",
        },
      },
    ],
    allowed: [
      {
        condition: "the app buffers its logs and makes the pino logger Nest's own",
        files: {
          'src/main.ts':
            "import { NestFactory } from '@nestjs/core';\nimport { Logger } from 'nestjs-pino';\n\nconst app = await NestFactory.create(RootModule, { bufferLogs: true });\n\napp.useLogger(app.get(Logger));\napp.enableShutdownHooks();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'one-instance-writes-every-record',
    unit: {
      axes: [],
      blocks: [
        'pino',
      ],
    },
    reported: [
      {
        condition: 'an adapter creates a pino instance of its own',
        files: {
          'src/features/payments/infrastructure/stripe/payment-gateway.adapter.ts':
            "import pino from 'pino';\n\nexport const logger = pino({ name: 'payments' });\n",
        },
      },
      {
        condition: 'a feature creates a pino instance by its named export',
        files: {
          'src/features/payments/application/report.ts':
            "import { pino } from 'pino';\n\nexport const createReport = () => pino();\n",
        },
      },
    ],
    allowed: [
      {
        condition: "the root creates the program's instance",
        files: {
          'src/root/logger.ts':
            "import pino from 'pino';\n\nexport const createLogger = () => pino({ hooks: { streamWrite: maskLine } });\n",
        },
      },
      {
        condition: 'the entry file creates the instance',
        files: {
          'src/main.ts':
            "import pino from 'pino';\n\nconst logger = pino();\n\nlogger.info('started');\n",
        },
      },
      {
        condition: "an adapter logs through a child of the program's instance",
        files: {
          'src/features/payments/infrastructure/stripe/payment-gateway.adapter.ts':
            "import type { Logger } from 'pino';\n\nexport const createGateway = (logger: Logger) => logger.child({ module: 'payments' });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'request-logger-takes-the-instance',
    unit: {
      axes: [],
      blocks: [
        'pino',
        'transports/http',
      ],
    },
    reported: [
      {
        condition: 'pino-http is given no options',
        files: {
          'src/root/server.ts':
            "import pinoHttp from 'pino-http';\n\nexport const requestLogger = pinoHttp();\n",
        },
      },
      {
        condition: 'pino-http is given options without the logger',
        files: {
          'src/root/server.ts':
            "import pinoHttp from 'pino-http';\n\nexport const requestLogger = pinoHttp({ quietReqLogger: true });\n",
        },
      },
      {
        condition: "Nest's logger module builds pino-http without the logger",
        files: {
          'src/root/root.module.ts':
            "import { LoggerModule } from 'nestjs-pino';\n\nexport const loggerModule = LoggerModule.forRoot({ pinoHttp: { quietReqLogger: true } });\n",
        },
      },
      {
        condition: "Nest's logger module is given no options",
        files: {
          'src/root/root.module.ts':
            "import { LoggerModule } from 'nestjs-pino';\n\nexport const loggerModule = LoggerModule.forRoot();\n",
        },
      },
    ],
    allowed: [
      {
        condition: "pino-http takes the program's instance",
        files: {
          'src/root/server.ts':
            "import pinoHttp from 'pino-http';\n\nexport const createRequestLogger = (logger: Logger) => pinoHttp({ logger });\n",
        },
      },
      {
        condition: "Nest's logger module hands pino-http the program's instance",
        files: {
          'src/root/root.module.ts':
            "import { LoggerModule } from 'nestjs-pino';\n\nexport const createLoggerModule = (logger: Logger) =>\n  LoggerModule.forRoot({ pinoHttp: { logger } });\n",
        },
      },
      {
        condition: 'pino-http takes options built elsewhere',
        files: {
          'src/root/server.ts':
            "import pinoHttp from 'pino-http';\n\nexport const createRequestLogger = (options: Options) => pinoHttp(options);\n",
        },
      },
    ],
  },
];

const commanderRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'commander-subcommand-built-as-a-command',
    unit: {
      blocks: [
        'commander',
      ],
    },
    reported: [
      {
        condition: "the root adds an option to a subcommand through the program's list",
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const register = (program: Command, refund: Command): void => {\n  program\n    .addCommand(refund.copyInheritedSettings(program))\n    .commands.at(-1)\n    ?.requiredOption('-o, --order <id>', 'the order to refund');\n};\n",
        },
      },
      {
        condition: "the root gives a subcommand its action through the program's list",
        files: {
          'src/root/program.ts':
            "import type { Command } from 'commander';\n\nexport const wire = (program: Command): void => {\n  program.commands.find((command) => command.name() === 'refund')?.action(() => undefined);\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a subcommand's factory gives its description, options and action",
        files: {
          'src/features/orders/presentation/bindings/commands/refund-order.ts':
            "import { Command } from 'commander';\n\nexport const createRefundCommand = ({ refundOrder }: RefundDependencies): Command =>\n  new Command('refund')\n    .description('Refund a paid order')\n    .requiredOption('-o, --order <id>', 'the order to refund')\n    .action(async () => {\n      await refundOrder();\n    });\n",
        },
      },
      {
        condition: "the root reads the program's list of commands",
        files: {
          'src/root/program.ts':
            "import type { Command } from 'commander';\n\nexport const namesOf = (program: Command): string[] => program.commands.map((command) => command.name());\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'commander-subcommand-registered-with-add-command',
    unit: {
      blocks: [
        'commander',
      ],
    },
    reported: [
      {
        condition: 'the root declares a stand-alone executable subcommand',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = (): Command => {\n  const program = new Command('shop');\n\n  program.command('refund', 'Refund a paid order', { executableFile: 'shop-refund' });\n\n  return program;\n};\n",
        },
      },
      {
        condition: 'the root builds a subcommand in place',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = (): Command => {\n  const program = new Command('shop');\n\n  program.command('refund').action(() => undefined);\n\n  return program;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the root adds each subcommand its factory built',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = (dependencies: ShopDependencies): Command => {\n  const program = new Command('shop');\n\n  program.addCommand(createRefundCommand(dependencies).copyInheritedSettings(program));\n\n  return program;\n};\n",
        },
      },
      {
        condition: 'code that imports no commander calls a command method',
        files: {
          'src/root/redis.ts': "export const ping = (redis: Redis) => redis.command('PING');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'commander-settings-copied-to-every-command',
    unit: {
      axes: [],
      blocks: [
        'commander',
      ],
    },
    reported: [
      {
        condition: 'a subcommand is added bare',
        files: {
          'src/root/program.ts':
            "import type { Command } from 'commander';\n\nexport const register = (program: Command, refund: Command): void => {\n  program.addCommand(refund);\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a subcommand's own statement copies the settings before it is added",
        files: {
          'src/root/program.ts':
            "import type { Command } from 'commander';\n\nexport const adopt = (parent: Command, children: readonly Command[]): void => {\n  for (const child of children) {\n    child.copyInheritedSettings(parent);\n    parent.addCommand(child);\n  }\n};\n",
        },
      },
      {
        condition: "a subcommand takes the program's settings as it is added",
        files: {
          'src/root/program.ts':
            "import type { Command } from 'commander';\n\nexport const register = (program: Command, refund: Command): void => {\n  program.addCommand(refund.copyInheritedSettings(program));\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'commander-exits-overridden',
    unit: {
      axes: [],
      blocks: [
        'commander',
      ],
    },
    reported: [
      {
        condition: 'the root builds the program without an exit override',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = ({ terminal }: ShopDependencies): Command =>\n  new Command('shop').configureOutput(terminal.writers);\n",
        },
      },
      {
        condition: "the entry file runs commander's global program without an exit override",
        files: {
          'src/main.ts': "import { program } from 'commander';\n\nprogram.parse();\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the root overrides the exits of the program',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = ({ terminal }: ShopDependencies): Command =>\n  new Command('shop').configureOutput(terminal.writers).exitOverride();\n",
        },
      },
      {
        condition: 'the root builds a group of subcommands that copies the settings of its parent',
        files: {
          'src/root/command-tree.ts':
            "import { Command } from 'commander';\n\nexport const groupOf = (name: string, parent: Command): Command =>\n  new Command(name).description('A group').copyInheritedSettings(parent);\n",
        },
      },
      {
        condition: 'a binding builds a subcommand that takes the settings of the program',
        files: {
          'src/features/orders/presentation/bindings/commands/refund-order.ts':
            "import { Command } from 'commander';\n\nexport const createRefundCommand = (): Command =>\n  new Command('refund').description('Refund a paid order').action(() => undefined);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'commander-output-through-the-programs-writers',
    unit: {
      axes: [],
      blocks: [
        'commander',
      ],
    },
    reported: [
      {
        condition: 'the root builds the program without its writers',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = (): Command => new Command('shop').exitOverride();\n",
        },
      },
      {
        condition: 'the program is given its writers without the error writer',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = ({ terminal }: ShopDependencies): Command =>\n  new Command('shop').exitOverride().configureOutput({\n    writeOut: (text) => terminal.out(text),\n    writeErr: (text) => terminal.err(text),\n  });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the program is given every writer',
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = ({ terminal }: ShopDependencies): Command =>\n  new Command('shop').exitOverride().configureOutput({\n    writeOut: (text) => terminal.out(text),\n    writeErr: (text) => terminal.err(text),\n    outputError: (text, write) => write(terminal.styleError(text)),\n  });\n",
        },
      },
      {
        condition: "the program is given the terminal's writers",
        files: {
          'src/root/program.ts':
            "import { Command } from 'commander';\n\nexport const createProgram = ({ terminal }: ShopDependencies): Command =>\n  new Command('shop').exitOverride().configureOutput(terminal.writers);\n",
        },
      },
    ],
  },
];

const bunliRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'bunli-subcommand-from-a-factory',
    unit: {
      blocks: [
        'bunli',
      ],
    },
    reported: [
      {
        condition: 'a factory returns a plain object in place of a defined command',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders.ts':
            "export const createListOrdersCommand = ({ listOrders }: ListOrdersDependencies) => ({\n  name: 'list',\n  handler: () => listOrders(),\n});\n",
        },
      },
      {
        condition: 'a command is defined at the top of its file',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders.ts':
            "import { defineCommand } from '@bunli/core';\n\nexport const listOrdersCommand = defineCommand({\n  name: 'list',\n  description: 'List the open orders',\n  options: {},\n  handler: () => undefined,\n});\n",
        },
      },
      {
        condition: 'a defined command leaves out its description',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders.ts':
            "import { defineCommand } from '@bunli/core';\n\nexport const createListOrdersCommand = ({ listOrders }: ListOrdersDependencies) =>\n  defineCommand({\n    name: 'list',\n    options: {},\n    handler: () => listOrders(),\n  });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a factory returns its defined command whole',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders.ts':
            "import { defineCommand } from '@bunli/core';\n\nexport const createListOrdersCommand = ({ listOrders }: ListOrdersDependencies) =>\n  defineCommand({\n    name: 'list',\n    description: 'List the open orders',\n    options: {},\n    handler: () => listOrders(),\n  });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'bunli-flags-declared-by-schema',
    unit: {
      axes: [],
      blocks: [
        'bunli',
      ],
    },
    reported: [
      {
        condition: 'a flag is declared by a bare schema',
        files: {
          'src/refund.ts':
            "import { defineCommand } from '@bunli/core';\nimport { z } from 'zod';\n\nexport const createRefundCommand = () =>\n  defineCommand({\n    name: 'refund',\n    description: 'Refund a paid order',\n    options: { order: z.string() },\n    handler: () => undefined,\n  });\n",
        },
      },
      {
        condition: 'a flag is declared by a plain object',
        files: {
          'src/refund.ts':
            "import { defineCommand } from '@bunli/core';\n\nexport const createRefundCommand = () =>\n  defineCommand({\n    name: 'refund',\n    description: 'Refund a paid order',\n    options: { order: { type: 'string', short: 'o' } },\n    handler: () => undefined,\n  });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a flag is declared by option and its schema',
        files: {
          'src/refund.ts':
            "import { defineCommand, option } from '@bunli/core';\n\nexport const createRefundCommand = () =>\n  defineCommand({\n    name: 'refund',\n    description: 'Refund a paid order',\n    options: {\n      order: option(orderIdSchema, { short: 'o', description: 'The order to refund' }),\n    },\n    handler: ({ flags }) => flags.order,\n  });\n",
        },
      },
      {
        condition: 'a flag is declared by an option named elsewhere',
        files: {
          'src/refund.ts':
            "import { defineCommand } from '@bunli/core';\n\nexport const createRefundCommand = () =>\n  defineCommand({\n    name: 'refund',\n    description: 'Refund a paid order',\n    options: { order: orderOption },\n    handler: () => undefined,\n  });\n",
        },
      },
    ],
  },
];

const kyRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'ky-retry-jitter-on',
    unit: {
      axes: [],
      blocks: [
        'ky',
      ],
    },
    reported: [
      {
        condition: 'an instance retries without jitter',
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) =>\n  ky.create({ prefixUrl: url, retry: { limit: 3 } });\n",
        },
      },
      {
        condition: "an instance keeps ky's default retries",
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) => ky.create({ prefixUrl: url });\n",
        },
      },
      {
        condition: 'an instance retries a number of times',
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) => ky.extend({ prefixUrl: url, retry: 3 });\n",
        },
      },
      {
        condition: 'an instance turns its jitter off',
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) =>\n  ky.create({ prefixUrl: url, retry: { limit: 3, jitter: false } });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'an instance retries with jitter',
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) =>\n  ky.create({ prefixUrl: url, retry: { limit: 3, jitter: true } });\n",
        },
      },
      {
        condition: 'an instance retries nothing',
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) =>\n  ky.create({ prefixUrl: url, retry: 0 });\n",
        },
      },
      {
        condition: 'an instance retries at most none',
        files: {
          'src/root/http.ts':
            "import ky from 'ky';\n\nexport const createCatalogueHttp = (url: string) =>\n  ky.create({ prefixUrl: url, retry: { limit: 0 } });\n",
        },
      },
      {
        condition: 'an instance extends one that already spreads its retries',
        files: {
          'src/root/http.ts':
            "import type { KyInstance } from 'ky';\n\nexport const withToken = (http: KyInstance, token: string) =>\n  http.extend({ headers: { authorization: token } });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ky-timeout-kept',
    unit: {
      axes: [],
      blocks: [
        'ky',
      ],
    },
    reported: [
      {
        condition: 'a call turns its timeout off',
        files: {
          'src/features/reports/infrastructure/http/report-api.adapter.ts':
            "import type { KyInstance } from 'ky';\n\nexport const exportReport = (http: KyInstance, month: string) =>\n  http.post('exports', { json: { month }, timeout: false });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a call sets a longer timeout',
        files: {
          'src/features/reports/infrastructure/http/report-api.adapter.ts':
            "import type { KyInstance } from 'ky';\n\nexport const exportReport = (http: KyInstance, month: string) =>\n  http.post('exports', { json: { month }, timeout: 60_000 });\n",
        },
      },
      {
        condition: 'a module that imports no ky turns a timeout of its own off',
        files: {
          'src/features/reports/application/schedule.ts':
            'export const schedule = { timeout: false };\n',
        },
      },
    ],
  },
];

const CLIENT_OF_THE_ROOT = 'src/root/query-client.ts';

const tanstackQueryRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'offline-path-left-to-its-use-case',
    unit: {
      blocks: [
        'integrations/remote-data',
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'the client keeps the default network mode',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () => new QueryClient();\n",
        },
      },
      {
        condition: "the client's mutations keep the default network mode",
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () =>\n  new QueryClient({ defaultOptions: { queries: { networkMode: 'always' } } });\n",
        },
      },
      {
        condition: 'a write pauses while offline',
        files: {
          'src/features/carts/presentation/bindings/commands/add-line.hooks.ts':
            "import { useMutation } from '@tanstack/react-query';\n\nexport const useAddLine = () => useMutation({ mutationFn: addLine, networkMode: 'online' });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the client runs its queries and mutations whatever the network',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () =>\n  new QueryClient({\n    defaultOptions: { queries: { networkMode: 'always' }, mutations: { networkMode: 'always' } },\n  });\n",
        },
      },
      {
        condition: 'the client is built from options made elsewhere',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = (options: QueryClientConfig) => new QueryClient(options);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'remote-data-failure-reaches-one-handler',
    unit: {
      axes: [],
      blocks: [
        'integrations/remote-data',
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'the client registers no handler of failures',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () => new QueryClient({ defaultOptions: {} });\n",
        },
      },
      {
        condition: 'the client handles the failed reads alone',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryCache, QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = (onFailure: (error: Error) => void) =>\n  new QueryClient({ queryCache: new QueryCache({ onError: onFailure }) });\n",
        },
      },
      {
        condition: 'a cache of mutations is built without a handler',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = (onFailure: (error: Error) => void) =>\n  new QueryClient({\n    queryCache: new QueryCache({ onError: onFailure }),\n    mutationCache: new MutationCache(),\n  });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the client hands every failure to one handler',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = (onError: (error: Error) => void) =>\n  new QueryClient({\n    queryCache: new QueryCache({ onError }),\n    mutationCache: new MutationCache({ onError }),\n  });\n",
        },
      },
      {
        condition: 'a spec builds a client of its own',
        files: {
          'src/root/__tests__/query-client.fixtures.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const testQueryClient = () => new QueryClient();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'invalidation-in-on-settled',
    unit: {
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a write invalidates its keys on success',
        files: {
          'src/features/orders/presentation/bindings/commands/cancel-order.hooks.ts':
            "import { useMutation } from '@tanstack/react-query';\n\nexport const useCancelOrder = () =>\n  useMutation({\n    mutationFn: (input: CancelOrderInput) => cancelOrder(input),\n    onSuccess: (_result, input) =>\n      queryClient.invalidateQueries({ queryKey: orderKeys.detail(input.orderId) }),\n  });\n",
        },
      },
      {
        condition: 'a write refetches its keys on failure',
        files: {
          'src/features/orders/presentation/bindings/commands/cancel-order.hooks.ts':
            "import { useMutation } from '@tanstack/react-query';\n\nexport const useCancelOrder = () =>\n  useMutation({\n    mutationFn: cancelOrder,\n    async onError() {\n      await queryClient.refetchQueries({ queryKey: orderKeys.all });\n    },\n  });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a write invalidates its keys once settled',
        files: {
          'src/features/orders/presentation/bindings/commands/cancel-order.hooks.ts':
            "import { useMutation } from '@tanstack/react-query';\n\nexport const useCancelOrder = () =>\n  useMutation({\n    mutationFn: (input: CancelOrderInput) => cancelOrder(input),\n    onSettled: (_result, _error, input) =>\n      queryClient.invalidateQueries({ queryKey: orderKeys.detail(input.orderId) }),\n  });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'in-flight-reads-cancelled-by-on-mutate',
    unit: {
      axes: [],
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a prediction is written without cancelling the reads in flight',
        files: {
          'src/carts/rename-cart.hooks.ts':
            'export const renameOptions = {\n  onMutate: (input: RenameInput) => {\n    const previous = queryClient.getQueryData(cartKeys.detail(input.cartId));\n\n    queryClient.setQueryData(cartKeys.detail(input.cartId), input.name);\n\n    return { previous };\n  },\n};\n',
        },
      },
      {
        condition: 'the reads are cancelled after the prediction is written',
        files: {
          'src/carts/rename-cart.hooks.ts':
            'export const renameOptions = {\n  async onMutate(input: RenameInput) {\n    queryClient.setQueryData(cartKeys.detail(input.cartId), input.name);\n    await queryClient.cancelQueries({ queryKey: cartKeys.detail(input.cartId) });\n  },\n};\n',
        },
      },
      {
        condition: 'a prediction is the whole body of onMutate',
        files: {
          'src/carts/rename-cart.hooks.ts':
            'export const renameOptions = {\n  onMutate: (input: RenameInput) => queryClient.setQueryData(cartKeys.detail(input.cartId), input.name),\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the reads in flight are cancelled before the prediction',
        files: {
          'src/carts/rename-cart.hooks.ts':
            'export const renameOptions = {\n  onMutate: async (input: RenameInput) => {\n    await queryClient.cancelQueries({ queryKey: cartKeys.detail(input.cartId) });\n\n    const previous = queryClient.getQueryData(cartKeys.detail(input.cartId));\n\n    queryClient.setQueryData(cartKeys.detail(input.cartId), input.name);\n\n    return { previous };\n  },\n};\n',
        },
      },
      {
        condition: 'a write puts its answer into the cache once it succeeds',
        files: {
          'src/carts/rename-cart.hooks.ts':
            'export const renameOptions = {\n  onSuccess: (cart: Cart) => {\n    queryClient.setQueryData(cartKeys.detail(cart.id), cart);\n  },\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'query-result-returned-as-status-union',
    unit: {
      axes: [],
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a hook spreads the result into flags',
        files: {
          'src/orders/order.hooks.ts':
            "import { useQuery } from '@tanstack/react-query';\n\nexport const useOrder = (orderId: OrderId): { order?: Order; isLoading: boolean } => {\n  const { data, isPending } = useQuery(orderQueryOptions(orderId));\n\n  return { order: data, isLoading: isPending };\n};\n",
        },
      },
      {
        condition: 'a hook returns parts of the result it keeps whole',
        files: {
          'src/orders/order.hooks.ts':
            "import { useQuery } from '@tanstack/react-query';\n\nexport function useOrder(orderId: OrderId) {\n  const query = useQuery(orderQueryOptions(orderId));\n\n  return { order: query.data, isLoading: query.isPending };\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a hook returns Query's own result",
        files: {
          'src/orders/order.hooks.ts':
            "import { useQuery } from '@tanstack/react-query';\n\nexport const useOrder = (orderId: OrderId): UseQueryResult<Order> =>\n  useQuery(orderQueryOptions(orderId));\n",
        },
      },
      {
        condition: 'a hook suspends the read',
        files: {
          'src/orders/order.hooks.ts':
            "import { useSuspenseQuery } from '@tanstack/react-query';\n\nexport const useOrder = (orderId: OrderId): Order => {\n  const { data } = useSuspenseQuery(orderQueryOptions(orderId));\n\n  return data;\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'query-retry-delay-spread-at-random',
    unit: {
      axes: [],
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: "the client keeps Query's default delay",
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () => new QueryClient();\n",
        },
      },
      {
        condition: 'a delay doubles with no random spread',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () =>\n  new QueryClient({\n    defaultOptions: {\n      queries: { retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000) },\n    },\n  });\n",
        },
      },
      {
        condition: 'a read waits a fixed delay',
        files: {
          'src/orders/order.hooks.ts':
            "export const orderOptions = { queryKey: ['orders'], retryDelay: 1000 };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the client spreads its backoff at random',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () =>\n  new QueryClient({\n    defaultOptions: {\n      queries: {\n        retryDelay: (attempt: number) => Math.random() * Math.min(1000 * 2 ** attempt, 30_000),\n      },\n    },\n  });\n",
        },
      },
      {
        condition: "the client's queries retry nothing",
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () =>\n  new QueryClient({ defaultOptions: { queries: { retry: false } } });\n",
        },
      },
      {
        condition: 'the client takes a delay named elsewhere',
        files: {
          [CLIENT_OF_THE_ROOT]:
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createQueryClient = () =>\n  new QueryClient({ defaultOptions: { queries: { retryDelay: jitteredDelay } } });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'query-client-built-in-the-render-function',
    unit: {
      axes: [],
      blocks: [
        'server',
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a client is built once at the top of a module',
        files: {
          'src/root/render-page.tsx':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport const renderPage = (url: string): string => renderToString(<App queryClient={queryClient} url={url} />);\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a client is built for each request the function renders',
        files: {
          'src/root/render-page.tsx':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const renderPage = (url: string): string => {\n  const queryClient = new QueryClient();\n\n  return renderToString(<App queryClient={queryClient} url={url} />);\n};\n",
        },
      },
    ],
  },
];

const strykerRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'equivalent-mutant-marked-on-its-line',
    unit: {
      axes: [],
      blocks: [
        'stryker',
      ],
    },
    reported: [
      {
        condition: 'a disable holds to the end of the file',
        files: {
          'src/clamp.ts':
            '// Stryker disable EqualityOperator: at the maximum both branches return it\nexport const clamp = (quantity: number): number => (quantity >= 10 ? 10 : quantity);\n',
        },
      },
      {
        condition: 'a disable names every mutator',
        files: {
          'src/clamp.ts':
            'export const clamp = (quantity: number): number =>\n  // Stryker disable next-line all: at the maximum both branches return it\n  quantity >= 10 ? 10 : quantity;\n',
        },
      },
      {
        condition: 'a span of disabled mutants is restored',
        files: {
          'src/clamp.ts':
            '// Stryker restore all\nexport const clamp = (quantity: number): number => quantity;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a mutant is marked on its line by its mutator',
        files: {
          'src/clamp.ts':
            'export const clamp = (quantity: number): number =>\n  // Stryker disable next-line EqualityOperator: at the maximum both branches return it\n  quantity >= 10 ? 10 : quantity;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'stryker-disable-gives-its-reason-after-the-colon',
    unit: {
      axes: [],
      blocks: [
        'stryker',
      ],
    },
    reported: [
      {
        condition: 'a mark gives no reason',
        files: {
          'src/clamp.ts':
            'export const clamp = (quantity: number): number =>\n  // Stryker disable next-line EqualityOperator\n  quantity >= 10 ? 10 : quantity;\n',
        },
      },
      {
        condition: 'a mark ends at its colon',
        files: {
          'src/clamp.ts':
            'export const clamp = (quantity: number): number =>\n  // Stryker disable next-line EqualityOperator:\n  quantity >= 10 ? 10 : quantity;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a mark states its reason after its colon',
        files: {
          'src/clamp.ts':
            'export const clamp = (quantity: number): number =>\n  // Stryker disable next-line EqualityOperator: at the maximum both branches return it\n  quantity >= 10 ? 10 : quantity;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'logic-kept-out-of-as-const',
    unit: {
      axes: [],
      blocks: [
        'stryker',
      ],
    },
    reported: [
      {
        condition: 'an as const literal holds a call',
        files: {
          'src/shipping.ts':
            'export const shippingRates = { standardCents: 499, expressCents: Math.round(499 * 1.8) } as const;\n',
        },
      },
      {
        condition: 'an as const literal holds a function',
        files: {
          'src/shipping.ts':
            'export const shippingRates = { isFree: (totalCents: number) => totalCents >= 5000 } as const;\n',
        },
      },
      {
        condition: 'an as const literal holds a condition',
        files: {
          'src/shipping.ts':
            'export const shippingRates = [isExpress ? 899 : 499, !isFree] as const;\n',
        },
      },
      {
        condition: 'an as const literal holds a template with a value',
        files: {
          'src/shipping.ts':
            'export const labels = { standard: `${carrier} standard` } as const;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an as const literal holds values written out and names',
        files: {
          'src/shipping.ts':
            "export const shippingRates = {\n  standardCents: 499,\n  refundCents: -499,\n  label: 'Standard',\n  isFree: isFreeShipping,\n  status: OrderStatus.Placed,\n  carriers: ['post', 'courier'],\n} as const;\n",
        },
      },
      {
        condition: 'a spec holds a table of calls in an as const literal',
        files: {
          'src/__tests__/shipping.test.ts':
            'export const rows = [{ order: orderOf() }] as const;\n',
        },
      },
    ],
  },
];

const suppressionRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'jscpd-suppression-gives-its-reason-after-the-colon',
    unit: {
      axes: [],
      blocks: [
        'jscpd',
      ],
    },
    reported: [
      {
        condition: 'a suppression opens with no reason',
        files: {
          'src/limits.ts':
            "// jscpd:ignore-start\nexport const billingLimits = [{ name: 'street' }];\n// jscpd:ignore-end\n",
        },
      },
      {
        condition: 'the reason of a suppression stands on the line above it',
        files: {
          'src/limits.ts':
            "// Billing's fields change with the tax authority's rules.\n// jscpd:ignore-start\nexport const billingLimits = [{ name: 'street' }];\n// jscpd:ignore-end\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a suppression states its reason after the colon',
        files: {
          'src/limits.ts':
            "// jscpd:ignore-start: billing's fields change with the tax authority's rules\nexport const billingLimits = [{ name: 'street' }];\n// jscpd:ignore-end\n",
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'jscpd-suppression-gives-its-reason-after-the-colon',
    unit: {
      axes: [],
      blocks: [
        'jscpd',
      ],
    },
    reported: [
      {
        condition: 'a python suppression opens with no reason',
        files: {
          'src/shop/limits.py':
            "# jscpd:ignore-start\nBILLING_LIMITS = [{'name': 'street'}]\n# jscpd:ignore-end\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a python suppression states its reason after the colon',
        files: {
          'src/shop/limits.py':
            "# jscpd:ignore-start: billing's fields change with the tax authority's rules\nBILLING_LIMITS = [{'name': 'street'}]\n# jscpd:ignore-end\n",
        },
      },
    ],
  },
  {
    language: 'json',
    slug: 'shared-preset-pinned-to-its-release-tag',
    unit: {
      axes: [],
      blocks: [
        'json',
        'renovate',
      ],
    },
    reported: [
      {
        condition: 'a preset of a repository is named alone',
        files: {
          'renovate.json': '{\n  "extends": ["github>droneey/renovate-config"]\n}\n',
        },
      },
      {
        condition: 'a preset of a repository is named by a branch',
        files: {
          'renovate.json': '{\n  "extends": ["github>droneey/renovate-config#main"]\n}\n',
        },
      },
      {
        condition: 'a preset of a repository is named by a major tag that moves',
        files: {
          'renovate.json': '{\n  "extends": ["gitlab>droneey/renovate-config:base#v1"]\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a preset of a repository is named with the tag of its version',
        files: {
          'renovate.json': '{\n  "extends": ["github>droneey/renovate-config#v1.4.0"]\n}\n',
        },
      },
      {
        condition: "a preset is one of Renovate's own",
        files: {
          'renovate.json': '{\n  "extends": ["config:recommended", ":semanticCommits"]\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'biome-suppression-names-one-rule',
    unit: {
      axes: [],
      blocks: [
        'biome',
      ],
    },
    reported: [
      {
        condition: 'a suppression names a group alone',
        files: {
          'src/labels.ts':
            '// biome-ignore lint: the body is one table\nexport const labels = { placed: 1 };\n',
        },
      },
      {
        condition: 'a suppression silences a rule in a whole file',
        files: {
          'src/labels.ts':
            "// biome-ignore-all lint/style/useNamingConvention: the keys are the API's\nexport const labels = { placed: 1 };\n",
        },
      },
      {
        condition: 'a suppression opens a range',
        files: {
          'src/labels.ts':
            "// biome-ignore-start lint/style/useNamingConvention: the keys are the API's\nexport const labels = { placed: 1 };\n// biome-ignore-end lint/style/useNamingConvention: the keys are the API's\n",
        },
      },
      {
        condition: 'a suppression silences the formatter',
        files: {
          'src/labels.ts':
            '// biome-ignore format: the table is aligned by hand\nexport const labels = { placed: 1 };\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a suppression names one rule',
        files: {
          'src/labels.ts':
            "// biome-ignore lint/style/useNamingConvention: the keys are the API's\nexport const labels = { placed: 1 };\n",
        },
      },
      {
        condition: 'a suppression names one rule with its value',
        files: {
          'src/labels.ts':
            '// biome-ignore lint/correctness/useExhaustiveDependencies(page): each page runs it again\nexport const labels = { placed: 1 };\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'biome-suppression-names-one-rule',
    unit: {
      axes: [],
      blocks: [
        'biome',
        'css',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet silences a whole file',
        files: {
          'src/styles/page.css':
            '/* biome-ignore-all lint/nursery/useLayeredStyles: it declares its own layers */\n.page {\n  color: red;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a stylesheet names one rule on one line',
        files: {
          'src/styles/page.css':
            '/* biome-ignore lint/nursery/useLayeredStyles: it declares its own layers */\n.page {\n  color: red;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ast-grep-suppression-names-one-rule',
    unit: {
      axes: [],
      blocks: [],
    },
    reported: [
      {
        condition: 'a suppression is bare',
        files: {
          'src/job.ts':
            "// Why: the scheduler calls a job's run.\n// ast-grep-ignore\nexport const run = () => undefined;\n",
        },
      },
      {
        condition: 'a suppression names several rules',
        files: {
          'src/job.ts':
            "// Why: the scheduler calls a job's run.\n// ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript, case-holds-no-logic@typescript\nexport const run = () => undefined;\n",
        },
      },
      {
        condition: 'a suppression names a rule without its language',
        files: {
          'src/job.ts':
            "// Why: the scheduler calls a job's run.\n// ast-grep-ignore: ast-grep-refuses-empty-verbs\nexport const run = () => undefined;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a suppression names one rule',
        files: {
          'src/job.ts':
            "// Why: the scheduler calls a job's run.\n// ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript\nexport const run = () => undefined;\n",
        },
      },
      {
        condition: 'a comment mentions the suppression in its text',
        files: {
          'src/job.ts':
            '// Silence one rule with ast-grep-ignore, never all of them.\nexport const run = () => undefined;\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'ast-grep-suppression-names-one-rule',
    unit: {
      axes: [],
      blocks: [],
    },
    reported: [
      {
        condition: 'a python suppression is bare',
        files: {
          'src/shop/orders.py':
            '# Why: the body is one table the function returns.\n# ast-grep-ignore\ndef table() -> list[int]:\n    return [0]\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a python suppression names one rule',
        files: {
          'src/shop/orders.py':
            '# Why: the body is one table the function returns.\n# ast-grep-ignore: function-within-its-limits@python\ndef table() -> list[int]:\n    return [0]\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'ast-grep-suppression-names-one-rule',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet suppression is bare',
        files: {
          'src/styles/page.css':
            '/* Why: the page spans the viewport by design. */\n/* ast-grep-ignore */\n.page {\n  inline-size: 100vw;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a stylesheet suppression names one rule',
        files: {
          'src/styles/page.css':
            '/* Why: the page spans the viewport by design. */\n/* ast-grep-ignore: full-width-leaves-out-the-scrollbar@css */\n.page {\n  inline-size: 100vw;\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ast-grep-reason-on-the-line-above',
    unit: {
      axes: [],
      blocks: [],
    },
    reported: [
      {
        condition: 'a suppression has no reason',
        files: {
          'src/job.ts':
            'export const job = {\n  // ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript\n  run: () => undefined,\n};\n',
        },
      },
      {
        condition: 'a suppression carries its reason after its rule',
        files: {
          'src/job.ts':
            "export const job = {\n  // Why: the scheduler calls a job's run.\n  // ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript  the name the contract imposes\n  run: () => undefined,\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a suppression has its reason on the line above',
        files: {
          'src/job.ts':
            "export const job = {\n  // Why: the scheduler calls a job's run.\n  // ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript\n  run: () => undefined,\n};\n",
        },
      },
      {
        condition: 'a suppression at the end of a line has its reason above that line',
        files: {
          'src/job.ts':
            "export const job = {\n  // Why: the scheduler calls a job's run.\n  run: () => undefined, // ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript\n};\n",
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'ast-grep-reason-on-the-line-above',
    unit: {
      axes: [],
      blocks: [],
    },
    reported: [
      {
        condition: 'a python suppression carries its reason after its rule',
        files: {
          'src/shop/orders.py':
            '# ast-grep-ignore: function-within-its-limits@python  the body is one table\ndef table() -> list[int]:\n    return [0]\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a python suppression has its reason on the line above',
        files: {
          'src/shop/orders.py':
            '# Why: the body is one table the function returns.\n# ast-grep-ignore: function-within-its-limits@python\ndef table() -> list[int]:\n    return [0]\n',
        },
      },
      {
        condition: 'a decorated function has its suppression and reason below the decorator',
        files: {
          'src/shop/orders.py':
            '@cache\n# Why: the body is one table the function returns.\n# ast-grep-ignore: function-within-its-limits@python\ndef table() -> list[int]:\n    return [0]\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'ast-grep-reason-on-the-line-above',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet suppression has no reason',
        files: {
          'src/styles/page.css':
            '.page {\n  /* ast-grep-ignore: full-width-leaves-out-the-scrollbar@css */\n  inline-size: 100vw;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a stylesheet suppression has its reason on the line above',
        files: {
          'src/styles/page.css':
            '.page {\n  /* Why: the page spans the viewport by design. */\n  /* ast-grep-ignore: full-width-leaves-out-the-scrollbar@css */\n  inline-size: 100vw;\n}\n',
        },
      },
    ],
  },
];

const frameworksPluginRows: readonly PluginRow[] = [
  ...nestjsRows,
  ...pinoRows,
  ...commanderRows,
  ...bunliRows,
  ...kyRows,
  ...tanstackQueryRows,
  ...strykerRows,
  ...suppressionRows,
];

export { frameworksPluginRows };
