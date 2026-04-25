# Founder-Badge einbauen

## Ausgangslage
- `users.is_founder` existiert bereits (boolean, default false). Omar = `true`.
- `public.user_profiles` View enthält `is_founder` bereits ✅
- `get_own_profile()` RPC gibt `is_founder` noch **nicht** zurück ❌
- Es gibt noch kein `FounderBadge` Component und keine UI-Anzeige ❌

## Schritte

### 1. Migration: `get_own_profile()` erweitern
RPC um `is_founder` ergänzen, damit das eigene Profil das Flag bekommt.

```sql
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id uuid, first_name text, last_name text, profile_image text,
  age integer, gender text, study_program text, study_phase text,
  focus text, intents text[], interests text[],
  tutoring_subject text, tutoring_desc text, tutoring_price numeric,
  bio text, intent_details jsonb, email_notifications_enabled boolean,
  is_founder boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.first_name, u.last_name, u.profile_image, u.age, u.gender,
         u.study_program, u.study_phase, u.focus, u.intents, u.interests,
         u.tutoring_subject, u.tutoring_desc, u.tutoring_price, u.bio,
         u.intent_details, u.email_notifications_enabled, u.is_founder
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;
```

### 2. TypeScript-Types & Hooks anpassen
- `src/hooks/useOwnProfile.ts`: `is_founder: boolean` zum Interface + Mapping
- `src/hooks/useDiscoverProfiles.ts`: `is_founder` in Select + UserProfile-Type
- `src/types/user.ts`: `is_founder?: boolean` ergänzen
- `src/pages/ProfileDetail.tsx`: `is_founder` mit aus `user_profiles` selecten

### 3. Neue Komponente: `src/components/ui/FounderBadge.tsx`
Schlankes Badge im Wes-Anderson-Stil:
- Krone-Icon (lucide `Crown`) + Label „Gründer"
- Goldakzent: `bg-primary/15 text-primary border border-primary/30`
- Kleine, elegante Pill-Form (rounded-md, px-2.5 py-1, text-xs, uppercase tracking-wide)
- Optional: `size?: 'sm' | 'md'` Variante für Karten vs. Header

### 4. Anzeige an 3 Stellen
- **Discover-Karte** (`UserProfileCard.tsx`): Badge neben dem Namen (klein)
- **ProfileDetail-Header** (`pages/ProfileDetail.tsx`): Badge prominent unter/neben dem Namen
- **Eigenes Profil** (`pages/Profile.tsx`): Badge im Header

### 5. Kein UI für andere User
Es gibt keine Admin-Funktion zum Setzen – das Flag wird manuell per SQL gepflegt (passt, weil nur du/Omar Founder seid).

## Ergebnis
Sobald die Migration durch ist und die ~5 Files angepasst sind, erscheint das goldene „Gründer"-Badge automatisch überall, wo Omars (und dein) Profil angezeigt wird.