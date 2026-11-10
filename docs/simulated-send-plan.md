# Plan: Simulated Notification Sending

Goal: after `POST /notifications` (status `queued`), simulate sending via the notification's
channel (`email` / `sms` / `push`) and update status to `sent` or `failed`.
Keep it simple (demo-like) yet complete enough to convey a real queue/worker design.

## New files

```
src/notifications/senders/
  notification-sender.ts   # interface
  email.sender.ts
  sms.sender.ts
  push.sender.ts
  senders.module.ts        # registers all three senders, exports a channel→sender map
src/notifications/dispatcher/
  notification-dispatcher.service.ts
```

## 1. Sender interface + 3 implementations

```ts
interface NotificationSender {
  channel: NotificationChannel;
  send(notification: Notification): Promise<void>;
}
```

One class per channel (`EmailSender`, `SmsSender`, `PushSender`). Each `send()`:
1. Logs e.g. `Sending email to <recipient>: <message>` (console is fine).
2. `await delay(this.simulatedLatencyMs)` — plain `new Promise(r => setTimeout(r, ms))`.
3. Throws if the recipient matches a deterministic failure marker (see §3).
4. Logs e.g. `Email delivered to <recipient>`.

`simulatedLatencyMs` is a **constructor argument with a default of 5000**.
The module wires the real value (5000) in production; tests override the module
(or provider) with a small value (e.g. 50ms). Do NOT hard-code the delay inside the class.

## 2. Dispatcher (single service, in-memory per-channel queues)

`NotificationDispatcherService` owns:
- `queues: Map<NotificationChannel, Notification[]>` (start empty)
- `processing: Map<NotificationChannel, boolean>`

`enqueue(notification)`:
- push onto that channel's queue
- if that channel is not currently processing, start (fire-and-forget) a drain loop:
  - set `processing[channel] = true`
  - while queue not empty: shift one `n`
    - `await senders[n.channel].send(n)` → `repository.updateStatus(n.id, "sent")`
    - on catch → `repository.updateStatus(n.id, "failed")`, log the error (never crash the worker)
  - set `processing[channel] = false`

Behavior: one-at-a-time per channel (per-channel worker), concurrent across channels.
~40 lines. No third-party queue library.

## 3. Deterministic failure trigger

So the `failed` status is reachable and testable without randomness:
if `notification.recipient` contains a marker (e.g. `fail`, or `@fail` / `+9999999999` —
pick one convention and document it in the sender), the sender throws.
Optional extra: a small random failure chance is fine, but the deterministic path
must exist for tests.

## 4. Wire into NotificationsService

In `create()`: after `repository.create(notification)`, call `dispatcher.enqueue(notification)`,
then return as before. Status transitions happen only in the dispatcher, via the repository.

Repository: add `updateStatus(id: string, status: NotificationStatus)` to the
`NotificationRepository` interface and the in-memory implementation
(set the status on the stored entity; no-op or warn if id not found).

NestJS wiring: register senders + dispatcher as providers in
`notifications.module.ts`; expose the channel→sender map (e.g. a factory provider or a
`NotificationSenders` holder class) so the dispatcher can resolve `senders[channel]`.

## Tests

Unit (`*.spec.ts` near each new file):
- Each sender: resolves after ~0ms with tiny injected delay; logs called (or skip log assertions);
  throws for the failure marker.
- Dispatcher: enqueue → eventually `updateStatus(id, "sent")`; sender throws →
  `updateStatus(id, "failed")` and the worker keeps processing subsequent items.
- Use tiny injected delays (5–50ms) or vi fake timers. No test may wait 5 seconds.

E2e (`test/notifications.e2e-spec.ts`, extend):
- POST → status `queued` immediately; poll GET until `sent` (override latency to ~50ms
  via module override).
- POST with failure-marker recipient → poll until `failed`.

## Constraints / house rules

- Do not introduce dependencies (no queue libs, no new packages).
- Run `pnpm run format` after every file change.
- All existing + new tests must pass (`pnpm test`, `pnpm test:e2e`) before done.
- Keep the service layer dumb: only the dispatcher touches status after creation.
- Update README if it documents behavior/statuses.
