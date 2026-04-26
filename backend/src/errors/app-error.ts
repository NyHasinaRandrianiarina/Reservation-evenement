export interface FieldError {
  field: string;
  message: string;
}

// Classe de base

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: FieldError[] | undefined;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errors?: FieldError[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Fix prototype chain pour instanceof
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Sous classes

/** 400 — Requête invalide */
export class BadRequestError extends AppError {
  constructor(message = "Requête invalide") {
    super(message, 400);
  }
}

/** 401 — Non authentifié */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentification requise") {
    super(message, 401);
  }
}

/** 403 — Accès interdit */
export class ForbiddenError extends AppError {
  constructor(message = "Accès interdit") {
    super(message, 403);
  }
}

/** 404 — Ressource introuvable */
export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable") {
    super(message, 404);
  }
}

/** 409 — Conflit (doublon, etc.) */
export class ConflictError extends AppError {
  constructor(message = "Cette ressource existe déjà") {
    super(message, 409);
  }
}

/** 422 — Erreurs de validation */
export class ValidationError extends AppError {
  constructor(errors: FieldError[], message = "Erreurs de validation") {
    super(message, 422, true, errors);
  }
}
