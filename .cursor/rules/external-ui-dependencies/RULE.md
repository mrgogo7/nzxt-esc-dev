---
When introducing a new external UI dependency (icons, UI libs, animations),
ALWAYS ensure the package is added to package.json before usage.

Rules:
- UI components MUST NOT import external icon libraries directly.
- All icon libraries MUST be wrapped under src/ui/icons/.
- External icon packages (e.g. lucide-react) MUST be runtime dependencies.
- Do NOT reference packages that are not present in package.json.

alwaysApply: true
---
