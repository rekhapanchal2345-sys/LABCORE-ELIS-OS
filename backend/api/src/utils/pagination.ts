export interface PaginationInput {
    page?: number;
    limit?: number;
  }
  
  export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
  }
  
  export const getPagination = ({
    page = 1,
    limit = 20,
  }: PaginationInput): PaginationResult => {
    const safePage = Math.max(1, Number(page) || 1);
  
    const safeLimit = Math.min(
      100,
      Math.max(1, Number(limit) || 20)
    );
  
    return {
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
    };
  };
  
  export const getPaginationMeta = (
    page: number,
    limit: number,
    total: number
  ) => {
    const totalPages = Math.ceil(total / limit);
  
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  };