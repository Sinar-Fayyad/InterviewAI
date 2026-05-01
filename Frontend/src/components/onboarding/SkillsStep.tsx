import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, Trash2 } from "lucide-react";
import { Skill, SkillCategory, categoryConfig } from "./types";

interface SkillsStepProps {
  skills: Skill[];
  newSkill: { name: string; category: SkillCategory; proficiency_level: number };
  setNewSkill: (s: { name: string; category: SkillCategory; proficiency_level: number }) => void;
  addSkill: () => void;
  removeSkill: (id: string) => void;
  selectedCategory: SkillCategory | "all";
  setSelectedCategory: (c: SkillCategory | "all") => void;
  filteredSkills: Skill[];
}

export const SkillsStep = ({
  skills, newSkill, setNewSkill, addSkill, removeSkill,
  selectedCategory, setSelectedCategory, filteredSkills,
}: SkillsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Code className="w-12 h-12 mx-auto mb-2 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Skills</h2>
        <p className="text-muted-foreground">Add at least one skill <span className="text-destructive">*</span></p>
      </div>

      <Card className="p-4 border-border">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input id="skillName" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="e.g., React, Python, Leadership" onKeyDown={(e) => e.key === "Enter" && addSkill()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
                <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level (1-5)</Label>
            <div className="flex items-center gap-2">
              <input type="range" id="proficiency" min="1" max="5" value={newSkill.proficiency_level} onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: parseInt(e.target.value) })} className="flex-1" />
              <span className="w-8 text-center font-medium">{newSkill.proficiency_level}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
          <Button onClick={addSkill} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />Add Skill
          </Button>
        </div>
      </Card>

      {skills.length > 0 && (
        <Card className="p-4 border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="font-semibold">Your Skills ({skills.length})</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant={selectedCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory("all")}>All</Button>
              {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="gap-1">
                  {categoryConfig[cat].icon}
                  <span className="hidden sm:inline">{categoryConfig[cat].label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filteredSkills.map((skill) => {
              const config = categoryConfig[skill.category];
              return (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className={`${config.color} shrink-0`}>
                      {config.icon}
                      <span className="ml-1 hidden sm:inline">{config.label}</span>
                    </Badge>
                    <span className="font-medium truncate">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className={`w-2 h-2 rounded-full ${level <= skill.proficiency_level ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
