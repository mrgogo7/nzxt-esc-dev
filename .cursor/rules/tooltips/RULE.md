---
TOOLTIP RULE (GLOBAL)

- The project uses a single tooltip system implemented in:
  src/ui/shared/tooltip/

- UI code MUST NOT import "react-tooltip" directly.
  Only src/ui/shared/tooltip/Tooltip.tsx may import it.

- Tooltips MUST be used via:
  import { Tooltip } from '@/ui/shared/tooltip';

- Do not use native HTML title="" attributes anywhere.

- Tooltip content must come from i18n via t('...') at call sites
  (Tooltip component receives resolved strings only).

- All new icon buttons must include a Tooltip unless the icon is purely decorative.


alwaysApply: true
---
