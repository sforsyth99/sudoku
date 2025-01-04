"use client";

import { IntlProvider as ReactIntlProvider } from "react-intl";
import enMessages from "../i18n/en.json";

const messages = {
  en: enMessages,
};

export function IntlProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactIntlProvider messages={messages.en} locale="en" defaultLocale="en">
      {children}
    </ReactIntlProvider>
  );
}
