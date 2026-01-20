import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./api";
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

async function throwIfResNotOk(res: HttpResponse) {
  if (res.status < 200 || res.status >= 300) {
    const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<HttpResponse> {
  const res = await CapacitorHttp.request({
    method: method as any,
    url: getApiUrl(url),
    headers: data ? { "Content-Type": "application/json" } : {},
    data: data,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await CapacitorHttp.get({
      url: getApiUrl(queryKey[0] as string),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return res.data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
