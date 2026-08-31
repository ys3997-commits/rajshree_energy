export class AccessDeniedError extends Error {
  constructor(message = "You do not have access to this page") {
    super(message);
    this.name = "AccessDeniedError";
  }
}
