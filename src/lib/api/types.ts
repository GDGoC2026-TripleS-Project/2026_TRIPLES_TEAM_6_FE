export type ApiFieldError = {
  field: string;
  reason: string;
  rejectedValue: unknown;
};

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error?: never;
      timestamp: string;
    }
  | {
      success: false;
      data?: never;
      error: ApiError;
      timestamp: string;
    };
