/**
 * Intent-Based Matching Utilities
 * 
 * Scoring logic for the Discover section that prioritizes
 * shared intents over static traits or engagement metrics.
 */

import {
  MATCHING_WEIGHTS,
  COMPATIBLE_INTENTS,
  ACTIVITY_THRESHOLDS,
  SCORE_BAND_SIZE,
} from "./matching-constants";

export interface ScoringContext {
  currentUserIntents: string[];
  currentUserStudyProgram: string | null;
  currentUserStudyPhase: string | null;
}

export interface ScoredProfile<T> {
  profile: T;
  score: number;
  hasSharedIntent?: boolean;
}

/**
 * Count the number of shared (identical) intents between two users
 */
export function countSharedIntents(
  userIntents: string[],
  profileIntents: string[] | null
): number {
  if (!profileIntents || profileIntents.length === 0) return 0;
  
  return userIntents.filter(intent => profileIntents.includes(intent)).length;
}

/**
 * Count compatible intent pairs (excluding already shared intents)
 * Compatible intents are predefined pairs that work well together
 */
export function countCompatibleIntents(
  userIntents: string[],
  profileIntents: string[] | null
): number {
  if (!profileIntents || profileIntents.length === 0) return 0;
  
  let count = 0;
  const alreadyCounted = new Set<string>();
  
  for (const userIntent of userIntents) {
    // Skip if this intent is already shared (don't double-count)
    if (profileIntents.includes(userIntent)) continue;
    
    for (const [intentA, intentB] of COMPATIBLE_INTENTS) {
      // Check both directions of the compatibility pair
      const isCompatible =
        (userIntent === intentA && profileIntents.includes(intentB)) ||
        (userIntent === intentB && profileIntents.includes(intentA));
      
      if (isCompatible) {
        // Create a unique key for this pair to avoid double-counting
        const pairKey = [userIntent, intentA === userIntent ? intentB : intentA]
          .sort()
          .join("-");
        
        if (!alreadyCounted.has(pairKey)) {
          alreadyCounted.add(pairKey);
          count++;
        }
      }
    }
  }
  
  return count;
}

/**
 * Calculate activity score based on last_active_at timestamp
 * Returns a value between 0 and 1
 */
export function calculateActivityScore(lastActiveAt: string | null): number {
  if (!lastActiveAt) return 0;
  
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const hoursAgo = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo <= ACTIVITY_THRESHOLDS.VERY_RECENT) return 1.0;
  if (hoursAgo <= ACTIVITY_THRESHOLDS.TODAY) return 0.8;
  if (hoursAgo <= ACTIVITY_THRESHOLDS.THIS_WEEK) return 0.5;
  return 0.2;
}

/**
 * Calculate study context match score
 * Returns 0, 1, or 2 based on matching program and/or phase
 */
export function calculateStudyContextScore(
  profileStudyProgram: string | null,
  profileStudyPhase: string | null,
  context: ScoringContext
): number {
  let score = 0;
  
  if (
    profileStudyProgram &&
    context.currentUserStudyProgram &&
    profileStudyProgram === context.currentUserStudyProgram
  ) {
    score += 1;
  }
  
  if (
    profileStudyPhase &&
    context.currentUserStudyPhase &&
    profileStudyPhase === context.currentUserStudyPhase
  ) {
    score += 1;
  }
  
  return score;
}

/**
 * Calculate the total relevance score for a profile
 * 
 * Score composition:
 * - Shared intents × 10 (dominant)
 * - Compatible intents × 5 (secondary)
 * - Study context × 2 (low weight)
 * - Recent activity × 1 (hygiene signal)
 */
export function calculateRelevanceScore<
  T extends {
    intents: string[] | null;
    study_program: string | null;
    study_phase?: string | null;
    last_active_at?: string | null;
  }
>(profile: T, context: ScoringContext): number {
  // Shared intents (primary signal)
  const sharedCount = countSharedIntents(
    context.currentUserIntents,
    profile.intents
  );
  
  // Compatible intents (secondary signal)
  const compatibleCount = countCompatibleIntents(
    context.currentUserIntents,
    profile.intents
  );
  
  // Study context (low weight)
  const studyScore = calculateStudyContextScore(
    profile.study_program,
    profile.study_phase ?? null,
    context
  );
  
  // Activity (hygiene signal)
  const activityScore = calculateActivityScore(profile.last_active_at ?? null);
  
  // Calculate total score
  return (
    sharedCount * MATCHING_WEIGHTS.SHARED_INTENT +
    compatibleCount * MATCHING_WEIGHTS.COMPATIBLE_INTENT +
    studyScore * MATCHING_WEIGHTS.STUDY_CONTEXT +
    activityScore * MATCHING_WEIGHTS.RECENT_ACTIVITY
  );
}

/**
 * Shuffle profiles within score bands for controlled randomization
 * This prevents static rankings and maintains diversity
 */
export function shuffleWithinScoreBands<T>(
  scoredProfiles: ScoredProfile<T>[],
  bandSize: number = SCORE_BAND_SIZE
): T[] {
  if (scoredProfiles.length === 0) return [];
  
  // Sort by score descending first
  const sorted = [...scoredProfiles].sort((a, b) => b.score - a.score);
  
  // Group into bands
  const bands: ScoredProfile<T>[][] = [];
  let currentBand: ScoredProfile<T>[] = [];
  let bandStartScore = sorted[0].score;
  
  for (const item of sorted) {
    // Start a new band if score drops below threshold
    if (bandStartScore - item.score >= bandSize && currentBand.length > 0) {
      bands.push(currentBand);
      currentBand = [];
      bandStartScore = item.score;
    }
    currentBand.push(item);
  }
  
  // Don't forget the last band
  if (currentBand.length > 0) {
    bands.push(currentBand);
  }
  
  // Shuffle within each band using Fisher-Yates
  const result: T[] = [];
  for (const band of bands) {
    const shuffled = shuffleArray(band);
    result.push(...shuffled.map(item => item.profile));
  }
  
  return result;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sort and shuffle profiles by relevance score
 * Main entry point for the matching algorithm
 * 
 * Primary grouping: Profiles with shared intents appear first
 * Secondary sorting: Within each group, sort by relevance score with band randomization
 */
export function sortByRelevance<
  T extends {
    intents: string[] | null;
    study_program: string | null;
    study_phase?: string | null;
    last_active_at?: string | null;
  }
>(profiles: T[], context: ScoringContext): T[] {
  // Calculate scores and check for shared intents
  const scored: ScoredProfile<T>[] = profiles.map(profile => ({
    profile,
    score: calculateRelevanceScore(profile, context),
    hasSharedIntent: countSharedIntents(context.currentUserIntents, profile.intents) > 0,
  }));
  
  // Split into two groups: with and without shared intents
  const withSharedIntent = scored.filter(p => p.hasSharedIntent);
  const withoutSharedIntent = scored.filter(p => !p.hasSharedIntent);
  
  // Sort and randomize each group separately
  const sortedWithShared = shuffleWithinScoreBands(withSharedIntent);
  const sortedWithoutShared = shuffleWithinScoreBands(withoutSharedIntent);
  
  // Combine: Profiles with shared intents first, then the rest
  return [...sortedWithShared, ...sortedWithoutShared];
}
