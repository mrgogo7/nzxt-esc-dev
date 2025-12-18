---
Preset architecture rule:

- Active preset is defined ONLY by:
  ActivePresetState.activePresetId + ActivePresetState.presets

- UI components must NEVER invent or cache their own “current preset”
  except as a render mirror that is always updated from storage.

- Any operation that changes which preset is active MUST:
  1) Update ActivePresetState via storage helper
  2) Persist the change
  3) Propagate the change through the render pipeline
     (Preset → RenderModel → sessionBus)

No shortcut, no UI-only state, no bypass.

alwaysApply: true
---
