// utils/logger.ts
/* eslint-disable no-console */
const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (!isProduction) {
      console.error(...args);
    }
  },
};
