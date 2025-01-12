import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "../app/providers/IntlProvider";
import { ThemeProvider } from "../app/providers/ThemeProvider";
import { vi, beforeAll } from 'vitest';
import type { ReactNode } from "react";

// Mock matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

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
        <IntlProvider>
          <ThemeProvider>
            {ui}
          </ThemeProvider>
        </IntlProvider>
      </QueryClientProvider>
    ),
    queryClient: testQueryClient,
  };
}
