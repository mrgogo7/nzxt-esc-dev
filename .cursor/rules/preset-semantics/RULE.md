---
Apply Preset rule:

- “Apply preset” is a semantic operation, not a UI toggle.
- Apply MUST mean:
  - activePresetId is changed
  - render model is recomputed from the new preset
  - the new render model is published via sessionBus

- Apply logic MUST NOT:
  - only change list highlight
  - only update local component state
  - rely on re-mounting components or key hacks

If a new feature needs to react to preset change,
it must listen to the same apply pipeline.
Preset extensibility rule:

- Preset objects are expected to grow:
  - background types (color, image, video, youtube, pinterest)
  - overlays
  - element transforms
  - metric bindings
  - future metadata

- Code must NOT assume:
  - a single background type
  - shallow comparison of preset objects
  - hardcoded background fields

All preset-to-visual logic MUST go through:
presetToRenderModel(preset)

No direct rendering from Preset in UI components.

Runtime sync rule:

- sessionBus is the ONLY allowed mechanism for:
  - Config → Kraken synchronization
  - Live preview propagation
  - Future auto-rotation / sequencing

- UI components MUST NOT:
  - directly mutate Kraken state
  - directly read other tabs’ state
  - invent parallel sync channels

If something needs to appear on Kraken,
it must arrive via sessionBus.

Storage boundary rule:

- ActivePresetState mutation is allowed ONLY in storage helpers.
- UI must never:
  - mutate preset objects directly
  - patch order arrays manually
  - infer default behavior (e.g., deleting default preset)

All invariants (default preset, order consistency, active preset validity)
must be enforced at the storage boundary.


alwaysApply: true
---
