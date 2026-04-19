// Database type definitions - Source of Truth matching Mermaid schema

export interface User {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  theme: string | null;
}

export interface Education {
  id: string;
  user_id: string;
  institution_name: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  position: string;
  company_name: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  certification_name: string;
  organization_name: string | null;
  date_obtained: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  proficiency: string | null;
  proficiency_level: number | null;
  created_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  interview_title: string;
  company_name: string | null;
  job_title: string | null;
  video_path: string | null;
  feedback: Record<string, unknown> | null;
  transcript: string | null;
  duration_minutes: number | null;
  emotional_analysis: Record<string, unknown> | null;
  score: number | null;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  salary_range: string | null;
  job_url: string | null;
  job_description: string | null;
  contact_name: string | null;
  contact_email: string | null;
  applied_at: string ;
  updated_at: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
}

export interface QuestionsList {
  id: string;
  user_id: string;
  company_name: string | null;
  job_title: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  questions_list_id: string;
  question: string;
  answer: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  media: string | null;
  scheduled_at: string | null;
  created_at: string;
}

// Legacy profile type for backward compatibility
export interface Profile extends User {
  id: string;
  full_name: string | null;
  skills: string[] | null;
  languages: string[] | null;
  onboarding_completed: boolean | null;
  linkedin_connected: boolean | null;
  google_connected: boolean | null;
  created_at: string;
  updated_at: string;
}
