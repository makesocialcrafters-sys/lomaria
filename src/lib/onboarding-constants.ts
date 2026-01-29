export const STUDY_PROGRAMS = [
  { value: "WiSo", label: "Wirtschafts- und Sozialwissenschaften (WiSo)" },
  { value: "WiRe", label: "Wirtschaftsrecht (WiRe)" },
  { value: "BBE", label: "Business and Economics (BBE)" },
] as const;

export const STUDY_PHASES = [
  { value: "steop", label: "STEOP-Phase" },
  { value: "cbk_hauptstudium", label: "CBK/Hauptstudium/Spezialisierung" },
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
  { value: "networking", label: "Kontakte für später knüpfen" },
  { value: "freundschaften", label: "Freundschaften aufbauen" },
] as const;

export const INTERESTS = [
  { value: "startup", label: "Ideen & neue Projekte" },
  { value: "marketing_branding", label: "Medien, Kommunikation & Wirkung" },
  { value: "finance_investing", label: "Geld, Wirtschaft & Entscheidungen" },
  { value: "consulting_strategie", label: "Probleme analysieren & lösen" },
  { value: "tech_digitalisierung", label: "Technik & digitale Produkte" },
  { value: "nachhaltigkeit", label: "Umwelt, Zukunft & Verantwortung" },
  { value: "politik_gesellschaft", label: "Gesellschaft, Politik & Diskussionen" },
  { value: "design_kreativitaet", label: "Design, Kreativität & Ideen" },
  { value: "sport_fitness", label: "Sport, Bewegung & Gesundheit" },
  { value: "lifestyle_events", label: "Kultur, Events & Stadtleben" },
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

// Intent Detail Flow Screen Configuration
export type IntentDetailScreen = {
  id: string;
  title: string;
  multiSelect: boolean;
  options: readonly { value: string; label: string }[];
};

export type IntentDetailConfig = {
  screens: readonly IntentDetailScreen[];
};

export const INTENT_DETAIL_OPTIONS: Record<string, IntentDetailConfig> = {
  projektpartner: {
    screens: [
      {
        id: "phase",
        title: "Projektphase",
        multiSelect: true,
        options: [
          { value: "idee", label: "Idee" },
          { value: "konzept", label: "Konzept" },
          { value: "umsetzung", label: "Umsetzung" },
          { value: "offen", label: "Offen" },
        ],
      },
      {
        id: "roles",
        title: "Gesuchte Rollen",
        multiSelect: true,
        options: [
          { value: "tech", label: "Tech" },
          { value: "design", label: "Design" },
          { value: "business", label: "Business" },
          { value: "organisation", label: "Organisation" },
          { value: "offen", label: "Offen" },
        ],
      },
    ],
  },
  startup: {
    screens: [
      {
        id: "status",
        title: "Status",
        multiSelect: false,
        options: [
          { value: "konkrete_idee", label: "Habe konkrete Idee" },
          { value: "grobe_idee", label: "Habe grobe Idee" },
          { value: "suche_mitgruender", label: "Suche Mitgründer" },
          { value: "anschliessen", label: "Möchte mich anschließen" },
        ],
      },
      {
        id: "contribution",
        title: "Eigener Beitrag",
        multiSelect: true,
        options: [
          { value: "tech", label: "Tech" },
          { value: "business", label: "Business" },
          { value: "design", label: "Design" },
          { value: "strategie", label: "Strategie" },
          { value: "zeit_motivation", label: "Zeit / Motivation" },
        ],
      },
    ],
  },
  networking: {
    screens: [
      {
        id: "focus",
        title: "Fokus",
        multiSelect: true,
        options: [
          { value: "austausch", label: "Austausch" },
          { value: "mentoring", label: "Mentoring" },
          { value: "karrieregespraeche", label: "Karrieregespräche" },
          { value: "orientierung", label: "Orientierung" },
        ],
      },
      {
        id: "area",
        title: "Bereich",
        multiSelect: true,
        options: [
          { value: "consulting", label: "Consulting" },
          { value: "finance", label: "Finance" },
          { value: "tech", label: "Tech" },
          { value: "marketing", label: "Marketing" },
          { value: "recht", label: "Recht" },
          { value: "offen", label: "Offen" },
        ],
      },
    ],
  },
  neue_leute: {
    screens: [
      {
        id: "type",
        title: "Art",
        multiSelect: true,
        options: [
          { value: "lernen", label: "Lernen" },
          { value: "gespraeche", label: "Gespräche" },
          { value: "freizeit", label: "Freizeit" },
          { value: "austausch", label: "Austausch" },
        ],
      },
      {
        id: "energy",
        title: "Energielevel",
        multiSelect: false,
        options: [
          { value: "ruhig", label: "Ruhig" },
          { value: "gemischt", label: "Gemischt" },
          { value: "aktiv", label: "Aktiv" },
        ],
      },
    ],
  },
  freundschaften: {
    screens: [
      {
        id: "type",
        title: "Art",
        multiSelect: false,
        options: [
          { value: "langfristig", label: "Langfristig" },
          { value: "unverbindlich", label: "Unverbindlich" },
          { value: "situativ", label: "Situativ" },
        ],
      },
      {
        id: "style",
        title: "Umgang",
        multiSelect: false,
        options: [
          { value: "tiefgehend", label: "Tiefgehend" },
          { value: "locker", label: "Locker" },
          { value: "beides", label: "Beides" },
        ],
      },
    ],
  },
} as const;

// Intent labels for display
export const INTENT_LABELS: Record<string, string> = {
  projektpartner: "Projektpartner",
  startup: "Startup",
  networking: "Networking",
  neue_leute: "Neue Leute",
  freundschaften: "Freundschaften",
  nachhilfe_anbieten: "Nachhilfe",
};

export type IntentDetails = Record<string, Record<string, string | string[]>>;

/**
 * Get the display label for an intent detail value
 */
export function getIntentDetailLabel(
  intent: string,
  field: string,
  value: string
): string {
  const config = INTENT_DETAIL_OPTIONS[intent];
  if (!config) return value;
  const screen = config.screens.find((s) => s.id === field);
  if (!screen) return value;
  return screen.options.find((o) => o.value === value)?.label ?? value;
}

/**
 * Get the screen title for an intent detail field
 */
export function getIntentDetailFieldTitle(intent: string, field: string): string {
  const config = INTENT_DETAIL_OPTIONS[intent];
  if (!config) return field;
  const screen = config.screens.find((s) => s.id === field);
  return screen?.title ?? field;
}

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
  intent_details: IntentDetails;
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
  intent_details: {},
};
