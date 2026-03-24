/** Generic paginated response from the API */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/** Generic API error response */
export interface ApiError {
  detail: string | ApiErrorDetail[];
}

export interface ApiErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}
