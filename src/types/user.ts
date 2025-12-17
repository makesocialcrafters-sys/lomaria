import type { Gender, Intent, Interest, StudyPhase, StudyProgram } from "@/lib/constants";

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  age: number | null;
  gender: Gender | null;
  study_program: StudyProgram | null;
  study_phase: StudyPhase | null;
  focus: string | null;
  intents: Intent[] | null;
  interests: Interest[] | null;
  tutoring_subject: string | null;
  tutoring_desc: string | null;
  tutoring_price: number | null;
  bio: string | null;
  created_at: string;
  last_active_at: string | null;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  profile_image: string | null;
  age: number | null;
  gender: Gender | null;
  study_program: StudyProgram | null;
  study_phase: StudyPhase | null;
  focus: string;
  intents: Intent[];
  interests: Interest[];
  tutoring_subject: string;
  tutoring_desc: string;
  tutoring_price: number | null;
  bio: string;
}
