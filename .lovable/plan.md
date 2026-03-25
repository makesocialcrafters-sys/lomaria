

## Bug Fix Plan -- 7 Issues

### 1. Fix broken profile navigation in UserProfileCard
**File:** `src/components/discover/UserProfileCard.tsx` line 17
Change `/profile/${user.id}` to `/discover/profile/${user.id}`.

### 2. Fix useOwnProfile crashing before onboarding
**File:** `src/hooks/useOwnProfile.ts` line 35
Change `.single()` to `.maybeSingle()`.

### 3. Consolidate duplicate constants
The root cause: `src/lib/constants.ts` has different labels than `src/lib/onboarding-constants.ts` for the same values (e.g. INTENTS "Networking / Karriere" vs "Kontakte fur spater knupfen").

**Fix:** Make `src/lib/constants.ts` re-export everything from `src/lib/onboarding-constants.ts` instead of defining its own arrays. Keep the type exports (`Gender`, `Intent`, etc.) so existing imports don't break.

Files affected:
- `src/lib/constants.ts` -- replace arrays with re-exports, keep type aliases
- `src/components/settings/IntentChipWithDetails.tsx` -- change `INTENTS, TUTORING_SUGGESTIONS` import to come from `@/lib/onboarding-constants`

### 4. Fix missing GRANT on user_profiles view
**Database migration:** `GRANT SELECT ON public.user_profiles TO authenticated;`

### 5. Fix Step8Preview showing raw study_phase
**File:** `src/components/onboarding/Step8Preview.tsx` line 62
Replace `{getLabel(data.study_phase, STUDY_PHASES)}` with `{data.study_phase}`. Remove `STUDY_PHASES` from the import.

Profile.tsx already renders `study_phase` directly -- no change needed there.

### 6. Fix Icebreaker flicker in ChatDetail
**File:** `src/pages/ChatDetail.tsx` line 380
Change `{messages.length === 0 && (` to `{!isLoading && messages.length === 0 && (`

### 7. Fix Opportunity button accessibility
**File:** `src/components/layout/BottomNavigation.tsx`
Add `aria-disabled="true"` and `aria-label="Opportunity – coming soon"` to the Opportunity button element.

