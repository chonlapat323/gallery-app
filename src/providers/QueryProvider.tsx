"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 นาที
            cacheTime: 10 * 60 * 1000, // 10 นาที
            retry: 1,
            refetchOnWindowFocus: false,
          },
          infiniteQueries: {
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            maxPages: 3, // เก็บแค่ 3 หน้าล่าสุด
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
