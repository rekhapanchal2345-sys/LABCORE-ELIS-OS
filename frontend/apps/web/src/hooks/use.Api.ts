"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
} from "../lib/api";

/* =======================================================
   TYPES
======================================================= */

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
}

interface ApiRequestOptions {
  headers?: HeadersInit;
  token?: string;
  signal?: AbortSignal;
}

/* =======================================================
   GENERIC API HOOK
======================================================= */

export function useApi<T = unknown>(
  endpoint?: string,
  options: UseApiOptions = {}
) {
  const {
    immediate = true,
  } = options;

  const [state, setState] =
    useState<UseApiState<T>>({
      data: null,
      loading:
        Boolean(endpoint) &&
        immediate,
      error: null,
    });

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* -------------------------------------------------------
     GET
  ------------------------------------------------------- */

  const get = useCallback(
    async (
      customEndpoint?: string,
      requestOptions?: ApiRequestOptions
    ) => {
      const url =
        customEndpoint ||
        endpoint;

      if (!url) {
        throw new Error(
          "API endpoint is required"
        );
      }

      try {
        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: true,
            error: null,
          }));
        }

        const response =
          await apiGet<T>(
            url,
            requestOptions
          );

        if (mountedRef.current) {
          setState({
            data:
              response.data ?? null,
            loading: false,
            error: null,
          });
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Request failed";

        if (mountedRef.current) {
          setState({
            data: null,
            loading: false,
            error: message,
          });
        }

        throw error;
      }
    },
    [endpoint]
  );

  /* -------------------------------------------------------
     POST
  ------------------------------------------------------- */

  const post = useCallback(
    async <B = unknown>(
      body?: B,
      customEndpoint?: string,
      requestOptions?: ApiRequestOptions
    ) => {
      const url =
        customEndpoint ||
        endpoint;

      if (!url) {
        throw new Error(
          "API endpoint is required"
        );
      }

      try {
        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: true,
            error: null,
          }));
        }

        const response =
          await apiPost<T, B>(
            url,
            body,
            requestOptions
          );

        if (mountedRef.current) {
          setState({
            data:
              response.data ?? null,
            loading: false,
            error: null,
          });
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Request failed";

        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: message,
          }));
        }

        throw error;
      }
    },
    [endpoint]
  );

  /* -------------------------------------------------------
     PUT
  ------------------------------------------------------- */

  const put = useCallback(
    async <B = unknown>(
      body?: B,
      customEndpoint?: string,
      requestOptions?: ApiRequestOptions
    ) => {
      const url =
        customEndpoint ||
        endpoint;

      if (!url) {
        throw new Error(
          "API endpoint is required"
        );
      }

      try {
        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: true,
            error: null,
          }));
        }

        const response =
          await apiPut<T, B>(
            url,
            body,
            requestOptions
          );

        if (mountedRef.current) {
          setState({
            data:
              response.data ?? null,
            loading: false,
            error: null,
          });
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Request failed";

        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: message,
          }));
        }

        throw error;
      }
    },
    [endpoint]
  );

  /* -------------------------------------------------------
     PATCH
  ------------------------------------------------------- */

  const patch = useCallback(
    async <B = unknown>(
      body?: B,
      customEndpoint?: string,
      requestOptions?: ApiRequestOptions
    ) => {
      const url =
        customEndpoint ||
        endpoint;

      if (!url) {
        throw new Error(
          "API endpoint is required"
        );
      }

      try {
        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: true,
            error: null,
          }));
        }

        const response =
          await apiPatch<T, B>(
            url,
            body,
            requestOptions
          );

        if (mountedRef.current) {
          setState({
            data:
              response.data ?? null,
            loading: false,
            error: null,
          });
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Request failed";

        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: message,
          }));
        }

        throw error;
      }
    },
    [endpoint]
  );

  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */

  const remove = useCallback(
    async (
      customEndpoint?: string,
      requestOptions?: ApiRequestOptions
    ) => {
      const url =
        customEndpoint ||
        endpoint;

      if (!url) {
        throw new Error(
          "API endpoint is required"
        );
      }

      try {
        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: true,
            error: null,
          }));
        }

        const response =
          await apiDelete<T>(
            url,
            requestOptions
          );

        if (mountedRef.current) {
          setState({
            data:
              response.data ?? null,
            loading: false,
            error: null,
          });
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Request failed";

        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: message,
          }));
        }

        throw error;
      }
    },
    [endpoint]
  );

  /* -------------------------------------------------------
     FILE UPLOAD
  ------------------------------------------------------- */

  const upload = useCallback(
    async (
      formData: FormData,
      customEndpoint?: string,
      requestOptions?: ApiRequestOptions
    ) => {
      const url =
        customEndpoint ||
        endpoint;

      if (!url) {
        throw new Error(
          "API endpoint is required"
        );
      }

      try {
        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: true,
            error: null,
          }));
        }

        const response =
          await apiUpload<T>(
            url,
            formData,
            requestOptions
          );

        if (mountedRef.current) {
          setState({
            data:
              response.data ?? null,
            loading: false,
            error: null,
          });
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Upload failed";

        if (mountedRef.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: message,
          }));
        }

        throw error;
      }
    },
    [endpoint]
  );

  /* -------------------------------------------------------
     RESET
  ------------------------------------------------------- */

  const reset = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  /* -------------------------------------------------------
     RETRY / REFRESH
  ------------------------------------------------------- */

  const refresh = useCallback(
    async () => {
      return get();
    },
    [get]
  );

  /* -------------------------------------------------------
     INITIAL REQUEST
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      endpoint &&
      immediate
    ) {
      void get();
    }
  }, [
    endpoint,
    immediate,
    get,
  ]);

  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,

    get,
    post,
    put,
    patch,
    delete: remove,
    upload,

    refresh,
    reset,
  };
}

/* =======================================================
   SPECIALIZED GET HOOK
======================================================= */

export function useApiGet<
  T = unknown
>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  return useApi<T>(
    endpoint,
    options
  );
}

/* =======================================================
   SPECIALIZED POST HOOK
======================================================= */

export function useApiPost<
  T = unknown
>(
  endpoint: string
) {
  return useApi<T>(
    endpoint,
    {
      immediate: false,
    }
  );
}

/* =======================================================
   SPECIALIZED PUT HOOK
======================================================= */

export function useApiPut<
  T = unknown
>(
  endpoint: string
) {
  return useApi<T>(
    endpoint,
    {
      immediate: false,
    }
  );
}

/* =======================================================
   SPECIALIZED DELETE HOOK
======================================================= */

export function useApiDelete<
  T = unknown
>(
  endpoint: string
) {
  return useApi<T>(
    endpoint,
    {
      immediate: false,
    }
  );
}

export default useApi;