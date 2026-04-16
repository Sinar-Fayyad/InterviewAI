-- Create educations table (separate from profiles)
CREATE TABLE public.educations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiences table (separate from profiles)
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  position TEXT NOT NULL,
  company_name TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certifications table (separate from profiles)
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certification_name TEXT NOT NULL,
  organization_name TEXT,
  date_obtained DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions_lists table
CREATE TABLE public.questions_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT,
  job_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table (linked to questions_lists)
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questions_list_id UUID NOT NULL REFERENCES public.questions_lists(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for LinkedIn posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  media TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update profiles table: add first_name, last_name, theme columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system';

-- Enable RLS on all new tables
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for educations
CREATE POLICY "Users can view their own educations" ON public.educations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own educations" ON public.educations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own educations" ON public.educations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own educations" ON public.educations FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for experiences
CREATE POLICY "Users can view their own experiences" ON public.experiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own experiences" ON public.experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own experiences" ON public.experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own experiences" ON public.experiences FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for certifications
CREATE POLICY "Users can view their own certifications" ON public.certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own certifications" ON public.certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own certifications" ON public.certifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own certifications" ON public.certifications FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for questions_lists
CREATE POLICY "Users can view their own questions_lists" ON public.questions_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own questions_lists" ON public.questions_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questions_lists" ON public.questions_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own questions_lists" ON public.questions_lists FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for questions (uses questions_list ownership)
CREATE POLICY "Users can view questions from their lists" ON public.questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.questions_lists WHERE id = questions_list_id AND user_id = auth.uid()));
CREATE POLICY "Users can create questions in their lists" ON public.questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.questions_lists WHERE id = questions_list_id AND user_id = auth.uid()));
CREATE POLICY "Users can update questions in their lists" ON public.questions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.questions_lists WHERE id = questions_list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete questions from their lists" ON public.questions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.questions_lists WHERE id = questions_list_id AND user_id = auth.uid()));

-- RLS policies for posts
CREATE POLICY "Users can view their own posts" ON public.posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.educations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.experiences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;