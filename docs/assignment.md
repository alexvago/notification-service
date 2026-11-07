# Take-Home Assignment: Notification Service

## Objective

Build a small notification service using Node.js and TypeScript. Expected effort: approximately 2 hours.

## Requirements

Implement the following REST API:

- `POST /notifications` — recipient, channel (email/sms/push), message. Returns id and queued status.
- `GET /notifications/{id}` — returns id, channel and current status.

## Behavior

When a notification is created: store it, simulate sending it, and update its status.

**Statuses:** `queued`, `sent`, `failed`.

## Optional Bonus: API Contract First Design

Define the API using OpenAPI (Swagger) and use the specification to validate incoming requests.

If OpenAPI is used, invalid requests should be rejected with appropriate error messages and status codes.

### Examples of validation:

- Required fields are present
- Supported notification channels only (email, sms, push)
- Message is not empty
- Request payload matches the API schema

## Technical Expectations

- Node.js + TypeScript
- Clear project structure
- Basic validation and error handling
- In-memory storage is sufficient (no database required)
- At least a few meaningful tests
- Clear README with instructions
- Any framework is allowed (Express, Fastify, NestJS, etc.)

## AI Usage

AI tools are allowed and encouraged. Include a short note covering:

- Which AI tools you used
- What tasks AI assisted with
- One example of AI-generated code you accepted
- One example you modified or rejected
- How you validated the final solution

## Deliverables

- Source code
- README with setup/run instructions
- AI usage notes

## Interview Discussion

We will discuss design decisions, trade-offs, testing approach, error handling, scalability, reliability, and how AI contributed to the implementation.

We are not looking for the most features or the most code. We are interested in clean, well-structured code that demonstrates good engineering practices.
