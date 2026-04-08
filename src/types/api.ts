export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiError {
  detail: string | ValidationErrorDetail[];
}
