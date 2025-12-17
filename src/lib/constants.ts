// Lomaria Constants - Study Programs, Intents, Interests

export const STUDY_PROGRAMS = [
  { value: "WiSo", label: "WiSo" },
  { value: "WiRe", label: "Wirtschaftsrecht (WiRe)" },
  { value: "BEE", label: "Business and Economics (BEE)" },
] as const;

export const STUDY_PHASES = [
  { value: "steop", label: "STEOP-Phase" },
  { value: "cbk_hauptstudium", label: "CBK / Hauptstudium" },
] as const;

export const GENDERS = [
  { value: "maennlich", label: "Männlich" },
  { value: "weiblich", label: "Weiblich" },
  { value: "divers", label: "Divers" },
  { value: "keine_angabe", label: "Keine Angabe" },
] as const;

export const INTENTS = [
  { value: "neue_leute", label: "Neue Leute kennenlernen" },
  { value: "projektpartner", label: "Projektpartner finden" },
  { value: "startup", label: "Startup / Gründer-Mitstreiter" },
  { value: "nachhilfe_anbieten", label: "Nachhilfe anbieten" },
  { value: "networking", label: "Networking / Karriere" },
  { value: "freundschaften", label: "Freundschaften (neutral)" },
] as const;

export const INTERESTS = [
  { value: "startup", label: "Startup / Entrepreneurship" },
  { value: "marketing_branding", label: "Marketing & Branding" },
  { value: "finance_investing", label: "Finance & Investing" },
  { value: "consulting_strategie", label: "Consulting & Strategie" },
  { value: "tech_digitalisierung", label: "Tech & Digitalisierung" },
  { value: "nachhaltigkeit", label: "Nachhaltigkeit" },
  { value: "politik_gesellschaft", label: "Politik & Gesellschaft" },
  { value: "design_kreativitaet", label: "Design & Kreativität" },
  { value: "sport_fitness", label: "Sport & Fitness" },
  { value: "lifestyle_events", label: "Lifestyle & Events" },
] as const;

export const TUTORING_SUGGESTIONS = [
  "Statistik 1",
  "Statistik 2",
  "Accounting 1",
  "Accounting 2",
  "Finance Basics",
  "Mathematik",
  "Mikroökonomie",
  "Makroökonomie",
  "Marketing",
  "Wirtschaftsrecht",
] as const;

export type StudyProgram = typeof STUDY_PROGRAMS[number]["value"];
export type StudyPhase = typeof STUDY_PHASES[number]["value"];
export type Gender = typeof GENDERS[number]["value"];
export type Intent = typeof INTENTS[number]["value"];
export type Interest = typeof INTERESTS[number]["value"];
