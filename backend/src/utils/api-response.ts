import type { Response } from "express";

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

interface FieldError {
  field: string;
  message: string;
}

interface SuccessResponseBody<T> {
  success: true;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: FieldError[];
  stack?: string;
}

export type ApiResponseBody<T = unknown> =
  | SuccessResponseBody<T>
  | ErrorResponseBody;

// ApiResponse — Helpers statiques
export class ApiResponse {
  /**
   * Réponse succès générique (200 par défaut)
   */
  static success<T>(
    res: Response,
    data: T,
    message: string,
    statusCode = 200,
    meta?: SuccessResponseBody<T>["meta"]
  ): void {
    const body: SuccessResponseBody<T> = {
      success: true,
      data,
      message,
    };

    if (meta) {
      body.meta = meta;
    }

    res.status(statusCode).json(body);
  }

  /**
   * Réponse création (201)
   */
  static created<T>(res: Response, data: T, message: string): void {
    ApiResponse.success(res, data, message, 201);
  }

  /**
   * Réponse paginée (200)
   * Calcule automatiquement last_page, from, to
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    perPage: number,
    message: string
  ): void {
    const lastPage = Math.ceil(total / perPage);
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    ApiResponse.success(res, data, message, 200, {
      pagination: {
        total,
        per_page: perPage,
        current_page: page,
        last_page: lastPage,
        from,
        to,
      },
    });
  }

  /**
   * Réponse erreur
   */
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: FieldError[]
  ): void {
    const body: ErrorResponseBody = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      body.errors = errors;
    }

    res.status(statusCode).json(body);
  }

  /**
   * Réponse sans contenu (204)
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }
}
