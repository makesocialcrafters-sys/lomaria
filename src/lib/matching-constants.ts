/**
 * Intent-Based Matching System Constants
 * 
 * This system prioritizes what students are looking for (intents) over static traits.
 * Weights are internal and not exposed to users.
 * 
 * User-facing explanation:
 * "Profile werden primär nach gemeinsamen und kompatiblen Intents angezeigt,
 * mit leichter Berücksichtigung von Studienkontext und Aktivität."
 */

// Scoring weights (internal only)
export const MATCHING_WEIGHTS = {
  SHARED_INTENT: 10,       // Primary signal - dominates all others
  COMPATIBLE_INTENT: 5,    // Secondary signal
  STUDY_CONTEXT: 2,        // Low weight - never excludes, only refines
  RECENT_ACTIVITY: 1,      // Very low weight - hygiene signal only
} as const;

// Compatible intent pairs (bidirectional)
// These represent intents that work well together even if not identical
export const COMPATIBLE_INTENTS: [string, string][] = [
  ["projektpartner", "startup"],      // Project partners ↔ Startup co-founders
  ["neue_leute", "freundschaften"],   // Meet new people ↔ Build friendships
  ["networking", "projektpartner"],   // Career networking ↔ Project partners
  ["networking", "startup"],          // Career networking ↔ Startup
];

// Activity decay thresholds (in hours)
export const ACTIVITY_THRESHOLDS = {
  VERY_RECENT: 1,      // Within last hour → score 1.0
  TODAY: 24,           // Within last day → score 0.8
  THIS_WEEK: 168,      // Within last week → score 0.5
  OLDER: Infinity,     // Older than a week → score 0.2
} as const;

// Score band size for controlled randomization
// Profiles within the same band may be shuffled for diversity
export const SCORE_BAND_SIZE = 5;
