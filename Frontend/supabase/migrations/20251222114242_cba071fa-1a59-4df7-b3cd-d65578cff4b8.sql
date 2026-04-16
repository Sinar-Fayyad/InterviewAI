-- Create skill categories enum
CREATE TYPE public.skill_category AS ENUM ('technical', 'soft_skills', 'tools', 'languages', 'other');

-- Create question_history table
CREATE TABLE public.question_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT,
  company TEXT,
  job_description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for question_history
ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for question_history
CREATE POLICY "Users can view their own question history"
  ON public.question_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own question history"
  ON public.question_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question history"
  ON public.question_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create interview_archives table
CREATE TABLE public.interview_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  recording_url TEXT,
  duration_seconds INTEGER,
  questions JSONB DEFAULT '[]'::jsonb,
  feedback JSONB DEFAULT '{}'::jsonb,
  emotion_analysis JSONB DEFAULT '{}'::jsonb,
  transcript TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for interview_archives
ALTER TABLE public.interview_archives ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview_archives
CREATE POLICY "Users can view their own interview archives"
  ON public.interview_archives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview archives"
  ON public.interview_archives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview archives"
  ON public.interview_archives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview archives"
  ON public.interview_archives FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_skills table for flexible unlimited skills
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category skill_category DEFAULT 'other',
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_skills
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_skills
CREATE POLICY "Users can view their own skills"
  ON public.user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skills"
  ON public.user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON public.user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON public.user_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Create job_applications table
CREATE TYPE public.application_status AS ENUM ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn');

CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  job_url TEXT,
  salary_range TEXT,
  location TEXT,
  status application_status DEFAULT 'saved',
  applied_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_applications
CREATE POLICY "Users can view their own job applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for job_applications updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_question_history_user_id ON public.question_history(user_id);
CREATE INDEX idx_interview_archives_user_id ON public.interview_archives(user_id);
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);