# Notification system

## Questions for stakeholders

- What is `recipient`? Is it just the email/phone number/user id where to route the notification to?
- What is the expected usage of this service?
- Are the different notification channels handled by the same system, or is it external systems/apis?


## Notes 

needs to be
- highly available


Eventual consistency might be ok, depending on the type of notification involved.

Seems like this system relies on downstream systems for actual delivery (email, sms, push), or is it the same system, that actually performs the operations?

If the system has very little traffic, it can deal itself with the various operations (monolithic), otherwise a more distributed approach might be necessary (separate service per delivery method).


Statuses are:
- queued
- sent
- failed

Which implies that created notifications are sent to some sort of queue. How does this system know the final status? Does the system deququeing messages also notifies back the notification system for success/failed delivery?


It is a bonus to go API spec-first and use the spec to validate apis.
Looks like this tool could to the trick -> @nest-openapi/validator. BUT, it's very new, so treat it carefully.


> Which AI tools you used

Local AI on my Macbook, using llama.cpp with model Qwen 3.6 (unsloth/Qwen3.6-35B-A3B-GGUF:Q4_K_M), and `pi coder` as agentic harness.

> What tasks AI assisted with

I used AI for:

- troubleshooting issues (openapi validator setup)
- generation of some boilerplate code, where nestjs cli couldn't go
- setup of storage abstraction and in-memory implementation
- create e2e tests for each endpoint

> One example of AI-generated code you accepted
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

manual review, testing
