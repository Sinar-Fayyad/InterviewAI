import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, Trash2, Pencil, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skill, SkillCategory, categoryConfig, ComponentMode } from "./types";
import { addSkill, updateSkill, deleteSkill } from "@/services/profileService";

interface SkillsStepProps {
  skills: Skill[];
  newSkill: { name: string; category: SkillCategory; proficiency_level: number };
  setNewSkill: (s: { name: string; category: SkillCategory; proficiency_level: number }) => void;
  addSkill: () => void;
  removeSkill: (id: string) => void;
  selectedCategory: SkillCategory | "all";
  setSelectedCategory: (c: SkillCategory | "all") => void;
  filteredSkills: Skill[];
  mode?: ComponentMode;
  userId?: string;
  onUpdateList?: (data: Skill[]) => void;
}

export const SkillsStep = ({
  skills, newSkill, setNewSkill, addSkill, removeSkill,
  selectedCategory, setSelectedCategory, filteredSkills,
  mode = "onboarding",
  userId,
  onUpdateList,
}: SkillsStepProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ name: string; category: SkillCategory; proficiency_level: number } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const isProfileMode = mode === "profile";

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditData({
      name: skill.name,
      category: skill.category,
      proficiency_level: skill.proficiency_level
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

const handleSave = async () => {
    if (!editData || !editingId || !userId) return;
    
    setSavingId(editingId);
    try {
      const skillData = {
        name: editData.name,
        category: editData.category,
        proficiency: editData.proficiency_level * 20,
      };
      // Convert string ID to number for backend API
      const backendId = parseInt(editingId, 10);
      await updateSkill(backendId, skillData);
      
      const updated = skills.map((s) => 
        s.id === editingId ? { ...s, name: editData.name, category: editData.category, proficiency_level: editData.proficiency_level } : s
      );
      onUpdateList?.(updated);
      
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Skill updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Convert string ID to number for backend API
      const backendId = parseInt(id, 10);
      await deleteSkill(backendId);
      removeSkill(id);
      toast({ title: "Success", description: "Skill removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!userId || !newSkill.name.trim()) return;
    
    setSavingId("new");
    try {
      const skillData = {
        name: newSkill.name.trim(),
        category: newSkill.category,
        proficiency: newSkill.proficiency_level * 20,
      };
      const result = await addSkill(userId, skillData);
      
      const newSkillWithId: Skill = {
        id: result.id,
        name: newSkill.name,
        category: newSkill.category,
        proficiency_level: newSkill.proficiency_level
      };
      onUpdateList?.([...skills, newSkillWithId]);
      
      setNewSkill({ name: "", category: "technical", proficiency_level: 3 });
      toast({ title: "Success", description: "Skill added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {!isProfileMode && (
        <div className="text-center mb-6">
          <Code className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Skills</h2>
          <p className="text-muted-foreground">Add at least one skill <span className="text-destructive">*</span></p>
        </div>
      )}
      
      {isProfileMode && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Skills</h2>
            <p className="text-muted-foreground">Your skills and expertise</p>
          </div>
        </div>
      )}

      <Card className="p-4 border-border">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input 
              id="skillName" 
              value={newSkill.name} 
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} 
              placeholder="e.g., React, Python, Leadership" 
              onKeyDown={(e) => e.key === "Enter" && addSkill()} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category" 
              value={newSkill.category} 
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })} 
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
                <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level (1-5)</Label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                id="proficiency" 
                min="1" 
                max="5" 
                value={newSkill.proficiency_level} 
                onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: parseInt(e.target.value) })} 
                className="flex-1" 
              />
              <span className="w-8 text-center font-medium">{newSkill.proficiency_level}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
          {isProfileMode && userId ? (
            <Button onClick={handleAddNew} disabled={savingId === "new" || !newSkill.name.trim()} variant="outline" className="w-full">
              {savingId === "new" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Plus className="w-4 h-4 mr-2" />Add Skill
            </Button>
          ) : (
            <Button onClick={addSkill} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />Add Skill
            </Button>
          )}
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
              const isEditing = editingId === skill.id;
              const isSaving = savingId === skill.id;
              const isDeleting = deletingId === skill.id;
              
              return (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group">
                  {isEditing && editData ? (
                    <div className="flex items-center gap-3 flex-1">
                      <Input 
                        value={editData.name} 
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="max-w-[150px]"
                      />
                      <select 
                        value={editData.category} 
                        onChange={(e) => setEditData({ ...editData, category: e.target.value as SkillCategory })} 
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
                          <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={editData.proficiency_level}
                          onChange={(e) => setEditData({ ...editData, proficiency_level: parseInt(e.target.value) })}
                          className="w-16"
                        />
                        <span className="w-6 text-center font-medium text-sm">{editData.proficiency_level}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className={`${config.color} shrink-0`}>
                        {config.icon}
                        <span className="ml-1 hidden sm:inline">{config.label}</span>
                      </Badge>
                      <span className="font-medium truncate">{skill.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className={`w-2 h-2 rounded-full ${level <= skill.proficiency_level ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(skill)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(skill.id)} 
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
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
