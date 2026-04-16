-- Add onboarding tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS linkedin_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS google_connected boolean DEFAULT false;