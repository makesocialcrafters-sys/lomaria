

## Plan: Remove Intent Detail Screens (Keep Only Nachhilfe)

### Summary
When selecting an intent in onboarding Step 4, the inline detail chips (Art, Energielevel, Phase, Rollen, etc.) will no longer appear. Only "Nachhilfe anbieten" keeps its detail fields (Fach, Beschreibung, Stundensatz).

### Changes

**File: `src/components/onboarding/Step4Intents.tsx`**
- Remove the call to `renderInlineDetailFields()` on line 327 (or the entire function). This removes the detail chip sub-screens for all non-nachhilfe intents.
- Remove the clearing logic for `INTENT_DETAIL_OPTIONS` in `handleIntentToggle` (lines 66-74) since detail options are no longer used.
- Clean up unused imports (`INTENT_DETAIL_OPTIONS`, `cn`) and unused state/props related to detail screens.

No other files need changes — this is a UI-only simplification of the onboarding step.

