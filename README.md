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


## API Specification

[openapi.json](./src/openapi.json)

### Notification Lifecycle

Notifications follow a simple queue-based lifecycle:

1. **`queued`** — Created via `POST /notifications`
2. **`sent`** — Successfully delivered (after simulated send)
3. **`failed`** — Send failed

Sending is simulated asynchronously. After creating a notification, poll `GET /notifications/:id` to check the final status.

**Simulated failure marker**: To trigger a delivery failure for testing, include `@fail` in the recipient (e.g. `test@fail.example.com`).


## Getting Started

1. Install dependencies

```
pnpm install
```

2. Run development server (in watch mode, so the server will restart on each change)

```
pnpm start:dev
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
