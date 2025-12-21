export const STUDY_PROGRAMS = [
  { value: "WiSo-BW", label: "WiSo - Betriebswirtschaft" },
  { value: "WiSo-IBW", label: "WiSo - Internationale Betriebswirtschaft" },
  { value: "WiSo-VW", label: "WiSo - Volkswirtschaft" },
  { value: "WiSo-WUP", label: "WiSo - Wirtschaft und Recht" },
  { value: "WiSo-WINF", label: "WiSo - Wirtschaftsinformatik" },
  { value: "WiRe", label: "Wirtschaftsrecht (WiRe)" },
  { value: "BBE", label: "Business and Economics (BBE)" },
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
  "Makroökonomie",
  "Mikroökonomie",
  "Mathematik",
  "Wirtschaftsrecht",
  "Marketing",
] as const;

export type OnboardingData = {
  first_name: string;
  last_name: string;
  profile_image: string | null;
  age: number | null;
  gender: string | null;
  study_program: string | null;
  study_phase: string | null;
  focus: string;
  intents: string[];
  interests: string[];
  tutoring_subject: string;
  tutoring_desc: string;
  tutoring_price: number | null;
  bio: string;
};

export const initialOnboardingData: OnboardingData = {
  first_name: "",
  last_name: "",
  profile_image: null,
  age: null,
  gender: null,
  study_program: null,
  study_phase: null,
  focus: "",
  intents: [],
  interests: [],
  tutoring_subject: "",
  tutoring_desc: "",
  tutoring_price: null,
  bio: "",
};
