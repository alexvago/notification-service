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
