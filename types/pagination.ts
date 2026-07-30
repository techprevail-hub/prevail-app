// types/pagination.ts

export interface Pagination {
  // Primary properties (used by the application)
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  
  // Aliases for API compatibility (optional)
  page?: number;
  limit?: number;
  total?: number;
  hasPrev?: boolean;
}

// Default pagination values
export const DEFAULT_PAGINATION: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  page: 1,
  limit: 10,
  total: 0,
  hasPrev: false,
};

// Helper function to normalize pagination data from API
export function normalizePagination(data: any): Pagination {
  if (!data) return { ...DEFAULT_PAGINATION };
  
  const currentPage = data?.currentPage ?? data?.page ?? 1;
  const pageSize = data?.pageSize ?? data?.limit ?? 10;
  const totalRecords = data?.totalRecords ?? data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(totalRecords / pageSize);
  
  return {
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    hasNext: data?.hasNext ?? data?.hasNext ?? false,
    hasPrevious: data?.hasPrevious ?? data?.hasPrev ?? false,
    // Aliases for backward compatibility
    page: currentPage,
    limit: pageSize,
    total: totalRecords,
    hasPrev: data?.hasPrevious ?? data?.hasPrev ?? false,
  };
}

// Helper function to safely get a pagination value
export function getPaginationProp(
  pagination: Pagination | null | undefined,
  key: keyof Pagination,
  defaultValue: any = 0
): any {
  if (!pagination) return defaultValue;
  
  // Handle aliases
  if (key === 'currentPage' && pagination.page !== undefined) {
    return pagination.page;
  }
  if (key === 'pageSize' && pagination.limit !== undefined) {
    return pagination.limit;
  }
  if (key === 'totalRecords' && pagination.total !== undefined) {
    return pagination.total;
  }
  if (key === 'hasPrevious' && pagination.hasPrev !== undefined) {
    return pagination.hasPrev;
  }
  
  return pagination[key] ?? defaultValue;
}