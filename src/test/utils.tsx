import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "../app/providers/IntlProvider";
import type { ReactNode } from "react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

export function renderWithProviders(ui: ReactNode) {
  const testQueryClient = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={testQueryClient}>
        <IntlProvider>{ui}</IntlProvider>
      </QueryClientProvider>
    ),
    queryClient: testQueryClient,
  };
}
