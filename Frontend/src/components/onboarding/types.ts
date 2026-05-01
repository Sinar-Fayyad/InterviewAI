import { Code, Users, Wrench, Languages, MoreHorizontal } from "lucide-react";
import React from "react";

export type ComponentMode = "onboarding" | "profile";

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
};

export type SkillCategory = "technical" | "soft_skills" | "tools" | "languages" | "other";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency_level: number;
};

export const categoryConfig: Record<SkillCategory, { label: string; icon: React.ReactNode; color: string }> = {
  technical: { label: "Technical", icon: React.createElement(Code, { className: "w-4 h-4" }), color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  soft_skills: { label: "Soft Skills", icon: React.createElement(Users, { className: "w-4 h-4" }), color: "bg-green-500/10 text-green-600 border-green-500/20" },
  tools: { label: "Tools", icon: React.createElement(Wrench, { className: "w-4 h-4" }), color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  languages: { label: "Languages", icon: React.createElement(Languages, { className: "w-4 h-4" }), color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  other: { label: "Other", icon: React.createElement(MoreHorizontal, { className: "w-4 h-4" }), color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};
