export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class InvalidEmailError extends DomainError {
  constructor(recipient: string) {
    super(`Invalid email recipient: "${recipient}"`);
    this.name = "InvalidEmailError";
  }
}

export class InvalidPhoneError extends DomainError {
  constructor(recipient: string) {
    super(`Invalid phone number for SMS: "${recipient}"`);
    this.name = "InvalidPhoneError";
  }
}

export class EmptyMessageError extends DomainError {
  constructor() {
    super("Notification message cannot be empty");
    this.name = "EmptyMessageError";
  }
}
