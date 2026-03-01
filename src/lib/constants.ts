// Lomaria Constants - Study Programs, Intents, Interests

export const STUDY_PROGRAMS = [
  { value: "uni_wien", label: "Universität Wien" },
  { value: "meduni_wien", label: "Medizinische Universität Wien" },
  { value: "tu_wien", label: "TU Wien" },
  { value: "wu_wien", label: "WU Wien" },
  { value: "boku_wien", label: "BOKU Wien" },
  { value: "vetmeduni_wien", label: "Vetmeduni Wien" },
  { value: "angewandte_wien", label: "Universität für angewandte Kunst Wien" },
  { value: "mdw_wien", label: "Universität für Musik und darstellende Kunst Wien" },
  { value: "muk_wien", label: "Music and Arts University of the City of Vienna" },
  { value: "sfu_wien", label: "Sigmund Freud University Wien" },
  { value: "webster_wien", label: "Webster University Vienna" },
  { value: "modul_wien", label: "MODUL University Vienna" },
  { value: "ceu_wien", label: "CEU Wien" },
  { value: "jam_wien", label: "Jam Music Lab" },
  { value: "fh_technikum", label: "FH Technikum Wien" },
  { value: "fh_wien", label: "FH des BFI Wien" },
  { value: "sonstige", label: "Sonstige" },
] as const;

export const STUDY_PHASES = [] as const;

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
export type StudyPhase = string;
export type Gender = typeof GENDERS[number]["value"];
export type Intent = typeof INTENTS[number]["value"];
export type Interest = typeof INTERESTS[number]["value"];
