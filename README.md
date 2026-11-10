# Notification Service

A simple notification service for email, sms and push notifications.

## Architecture

Notifications are enqueued after creation and processed asynchronously per channel (email, sms, push). Each channel processes one notification at a time, but channels work concurrently.

## Tech stack

- TypeScript
- Node.JS
- NestJS
- OpenAPI
- Vitest

## Getting Started

1. Install dependencies

```
pnpm install
```

2. Run development server (in watch mode, so the server will restart on each change)

```
pnpm start:dev
```

## Test

Run unit tests with:

```
pnpm test
```

Or use this to also get test coverage results:
```
pnpm test:cov
```


Use this for E2E tests

```
pnpm test:e2e
```



## Build

1. Build the project for production

```
pnpm run build
```

2. Run it

```
pnpm start:prod
```



## API Specification

[openapi.json](./src/openapi.json)

### Notification Lifecycle

Notifications follow a simple queue-based lifecycle:

1. **`queued`** — Created via `POST /notifications`
2. **`sent`** — Successfully delivered (after simulated send)
3. **`failed`** — Send failed

Sending is simulated asynchronously. After creating a notification, poll `GET /notifications/:id` to check the final status.

**Simulated failure marker**: To trigger a delivery failure for testing, include `@fail` in the recipient (e.g. `test@fail.example.com`).




## AI Usage notes

> Which AI tools you used

Local AI on my Macbook, using llama.cpp and `pi coder` as agentic harness.
Used the following models:
- Qwen 3.8 27B for some architectural soundness checks and planning (slower model)
- Qwen 3.6 35B for implementations

> What tasks AI assisted with

I used AI for:

- troubleshooting issues (openapi validator setup)
- generation of some boilerplate code, where nestjs cli couldn't go
- setup of storage abstraction and in-memory implementation
- create e2e tests for each endpoint

> One example of AI-generated code you accepted

[Dispatcher code](src/notifications/dispatcher/notification-dispatcher.service.ts) as it was mostly to 'mock' a real queueing service


> One example you modified or rejected

Getting support for setting up @nest-openapi/validator, it provided an invalid configuration, so I manually modified to cleanup the extra unnecessary config it generated (and I did not request). Then I still had an issue with `import addFormats from "ajv-formats";` which would give me the error
```
This expression is not callable.
  Type 'typeof import("/Users/avago/Projects/ikea-notification-system/node_modules/.pnpm/ajv-formats@3.0.1/node_modules/ajv-formats/dist/index")' has no call signatures.
```

The AI tried to change the way the module would be imported, settling for directly calling

```
configure: (ajv: any) => {
    require("ajv-formats")(ajv);
}
```

which still broke the NestJS server (as it is fully ESM).
The solution in the end was just a Google search away, and it was enough to use ` addFormats.default(ajv);`

> How you validated the final solution

manual review, automated testing
