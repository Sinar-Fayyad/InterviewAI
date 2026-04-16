import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Code, Users, Wrench, Languages, MoreHorizontal, Pencil, Check, X } from "lucide-react";

type SkillCategory = "technical" | "soft_skills" | "tools" | "languages" | "other";

interface Skill {
  id: string;
  name: string;
  category: SkillCategory | null;
  proficiency_level: number | null;
  created_at: string;
}

const categoryConfig: Record<SkillCategory, { label: string; icon: React.ReactNode; color: string }> = {
  technical: { label: "Technical", icon: <Code className="w-4 h-4" />, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  soft_skills: { label: "Soft Skills", icon: <Users className="w-4 h-4" />, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  tools: { label: "Tools", icon: <Wrench className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  languages: { label: "Languages", icon: <Languages className="w-4 h-4" />, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  other: { label: "Other", icon: <MoreHorizontal className="w-4 h-4" />, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};


export const SkillsManagerSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ category: SkillCategory; proficiency: number } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "technical" as SkillCategory,
    proficiency_level: 3,
  });

  useEffect(() => {
    if (user) {
      fetchSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const { data } = await api.get("/skills");
      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast({ title: "Error", description: "Failed to load skills", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      toast({ title: "Missing Information", description: "Please enter a skill name", variant: "destructive" });
      return;
    }

    setAdding(true);
    try {
      await api.post("/skills", {
        name: newSkill.name.trim(),
        category: newSkill.category,
        proficiency_level: newSkill.proficiency_level,
      });

      toast({ title: "Skill Added", description: `${newSkill.name} has been added` });
      setNewSkill({ name: "", category: "technical", proficiency_level: 3 });
      fetchSkills();
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    try {
      await api.delete(`/skills/${id}`);
      toast({ title: "Skill Removed", description: `${name} has been removed` });
      setSkills(skills.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({ title: "Error", description: "Failed to remove skill", variant: "destructive" });
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingId(skill.id);
    setEditData({
      category: skill.category || "other",
      proficiency: skill.proficiency_level || 3,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSaveEdit = async (skillId: string) => {
    if (!editData) return;
    
    setSavingId(skillId);
    try {
      await api.put(`/skills/${skillId}`, {
        category: editData.category,
        proficiency_level: editData.proficiency,
      });

      setSkills(skills.map((s) => 
        s.id === skillId 
          ? { ...s, category: editData.category, proficiency_level: editData.proficiency }
          : s
      ));
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Skill updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update skill", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const filteredSkills = selectedCategory === "all" 
    ? skills 
    : skills.filter((s) => s.category === selectedCategory);

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  const totalSkills = skills.length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center gradient-card border-border shadow-card">
          <p className="text-2xl font-bold">{totalSkills}</p>
          <p className="text-xs text-muted-foreground">Total Skills</p>
        </Card>
        {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
          <Card key={cat} className="p-4 text-center gradient-card border-border shadow-card">
            <p className="text-2xl font-bold">{skillsByCategory[cat]?.length || 0}</p>
            <p className="text-xs text-muted-foreground">{categoryConfig[cat].label}</p>
          </Card>
        ))}
      </div>

      {/* Add Skill Form */}
      <Card className="gradient-card border-border shadow-card p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Skill
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input
              id="skillName"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g., React, Python, Leadership"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
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
                <option key={cat} value={cat}>
                  {categoryConfig[cat].label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency (1-5)</Label>
            <div className="flex items-center gap-2 h-10">
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
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAddSkill}
              disabled={adding}
              className="w-full"
              variant="hero"
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Skills List */}
      <Card className="gradient-card border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Your Skills</h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="gap-1"
              >
                {categoryConfig[cat].icon}
                <span className="hidden sm:inline">{categoryConfig[cat].label}</span>
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedCategory === "all" 
                ? "No skills added yet. Add your first skill!" 
                : `No ${categoryConfig[selectedCategory].label.toLowerCase()} skills found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSkills.map((skill) => {
              const cat = skill.category || "other";
              const config = categoryConfig[cat];
              const isEditing = editingId === skill.id;
              const isSaving = savingId === skill.id;
              
              return (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group"
                >
                  {isEditing && editData ? (
                    <div className="flex items-center gap-4 flex-1 pr-4">
                      <span className="font-medium min-w-[100px]">{skill.name}</span>
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value as SkillCategory })}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {(Object.keys(categoryConfig) as SkillCategory[]).map((c) => (
                          <option key={c} value={c}>{categoryConfig[c].label}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={editData.proficiency}
                          onChange={(e) => setEditData({ ...editData, proficiency: parseInt(e.target.value) })}
                          className="w-20"
                        />
                        <span className="w-6 text-center text-sm">{editData.proficiency}</span>
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
                    {!isEditing && skill.proficiency_level && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= skill.proficiency_level! 
                                ? "bg-primary" 
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(skill.id)} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id, skill.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
