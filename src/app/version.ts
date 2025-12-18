// Application version information
// Structured version data, no side effects.

export const APP_VERSION = {
  major: 2,
  minor: 5,
  build: 1217,
  toString(): string {
    return `${this.major}.${this.minor}.${this.build}`;
  },
} as const;
