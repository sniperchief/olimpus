export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {}

export class NotFoundError extends AppError {}

export class PayloadTooLargeError extends AppError {}

export class PersonaOutputError extends AppError {}

export class PersonaRefusalError extends AppError {
  constructor(toolName: string, stopDetails: unknown) {
    super(`Persona refused tool call ${toolName}: ${JSON.stringify(stopDetails)}`);
  }
}
