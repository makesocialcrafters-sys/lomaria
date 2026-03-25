// Re-export everything from onboarding-constants as single source of truth
export {
  STUDY_PROGRAMS,
  STUDY_PHASES,
  GENDERS,
  INTENTS,
  INTERESTS,
  TUTORING_SUGGESTIONS,
} from "@/lib/onboarding-constants";

// Type aliases for backward compatibility
export type StudyProgram = string;
export type StudyPhase = string;
export type Gender = string;
export type Intent = string;
export type Interest = string;
