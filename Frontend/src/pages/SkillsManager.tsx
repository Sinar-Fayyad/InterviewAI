import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { addSkill as addSkillApi, deleteSkill as deleteSkillApi } from "@/services/profileService";
import api from "@/services/api";
import { Plus, Trash2, Loader2, Code, Users, Wrench, Languages, MoreHorizontal } from "lucide-react";

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

const SkillsManager = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
  
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "technical" as SkillCategory,
    proficiency_level: 3,
  });

  useEffect(() => {
    if (userId) fetchSkills();
  }, [userId]);

  const fetchSkills = async () => {
    if (!userId) return;
    try {
      // Fetch skills from profile endpoint
      const { data } = await api.get(`/profile/${userId}`);
      const profileData = data?.payload || data;
      // Skills might be in user_skills or skills array
      setSkills(profileData?.user_skills || profileData?.skills || []);
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
    if (!userId) return;

    setAdding(true);
    try {
      const result = await addSkillApi(userId, {
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
      await deleteSkillApi(id);
      toast({ title: "Skill Removed", description: `${name} has been removed` });
      setSkills(skills.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({ title: "Error", description: "Failed to remove skill", variant: "destructive" });
    }
  };

  const filteredSkills = selectedCategory === "all" ? skills : skills.filter((s) => s.category === selectedCategory);

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = (skill.category || "other") as SkillCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  const totalSkills = skills.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Skills Manager</h1>
          <p className="text-muted-foreground">Manage your unlimited skills with categories for better organization</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="gradient-card border-border shadow-card p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add New Skill
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skillName">Skill Name</Label>
                <Input id="skillName" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="e.g., React, Python, Leadership" onKeyDown={(e) => e.key === "Enter" && handleAddSkill()} />
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
                  <span>Beginner</span><span>Expert</span>
                </div>
              </div>
              <Button onClick={handleAddSkill} disabled={adding} className="w-full" variant="hero">
                {adding ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>) : (<><Plus className="w-4 h-4 mr-2" />Add Skill</>)}
              </Button>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card className="gradient-card border-border shadow-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold">Your Skills</h2>
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

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {selectedCategory === "all" ? "No skills added yet. Add your first skill!" : `No ${categoryConfig[selectedCategory].label.toLowerCase()} skills found.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSkills.map((skill) => {
                    const cat = (skill.category || "other") as SkillCategory;
                    const config = categoryConfig[cat];
                    return (
                      <div key={skill.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="outline" className={`${config.color} shrink-0`}>
                            {config.icon}
                            <span className="ml-1 hidden sm:inline">{config.label}</span>
                          </Badge>
                          <span className="font-medium truncate">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {skill.proficiency_level && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div key={level} className={`w-2 h-2 rounded-full ${level <= skill.proficiency_level! ? "bg-primary" : "bg-muted-foreground/30"}`} />
                              ))}
                            </div>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSkill(skill.id, skill.name)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillsManager;
