---
## Application Identity & Versioning — HARD RULE

- Application name and version MUST be sourced ONLY from:
  - src/app/meta.ts (APP_META)
  - src/app/version.ts (APP_VERSION)

Forbidden:
- Hardcoded app name or version anywhere else
- Reading version from package.json
- Environment-based versioning
- Duplicating displayName, appName, or version in UI, storage, i18n, export/import, or diagnostics

Allowed:
- Importing APP_META / APP_VERSION for:
  - UI display
  - Preset export/import metadata
  - Migration checks
  - i18n fallback strings
  - Diagnostics

If a new feature needs app name or version:
→ It MUST import from src/app/meta.ts or src/app/version.ts.

alwaysApply: true
---
