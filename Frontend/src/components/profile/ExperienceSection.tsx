import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Loader2, Check, X } from "lucide-react";

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExperienceSectionProps {
  data: Experience[];
  userId: string;
  onUpdate: (data: Experience[]) => void;
}

// Mock API calls
const mockAddExperience = async (userId: string, exp: Experience): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `exp_${Date.now()}`;
};

const mockUpdateExperience = async (id: string, exp: Experience): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
};

const mockDeleteExperience = async (id: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return true;
};

export const ExperienceSection = ({ data, userId, onUpdate }: ExperienceSectionProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Experience | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id || null);
    setEditData({ ...exp });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData || !editingId) return;
    
    setSavingId(editingId);
    try {
      await mockUpdateExperience(editingId, editData);
      const updated = data.map((e) => (e.id === editingId ? { ...editData, id: editingId } : e));
      onUpdate(updated);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Experience updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await mockDeleteExperience(id);
      onUpdate(data.filter((e) => e.id !== id));
      toast({ title: "Success", description: "Experience removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!newExperience.company.trim()) {
      toast({ title: "Missing Info", description: "Please enter company name", variant: "destructive" });
      return;
    }
    
    setSavingId("new");
    try {
      const id = await mockAddExperience(userId, newExperience);
      onUpdate([...data, { ...newExperience, id }]);
      setNewExperience({ company: "", position: "", startDate: "", endDate: "", description: "" });
      setIsAddingNew(false);
      toast({ title: "Success", description: "Experience added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>Your professional experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((exp) => {
          const isEditing = editingId === exp.id;
          const isSaving = savingId === exp.id;
          const isDeleting = deletingId === exp.id;

          return (
            <div key={exp.id} className="p-4 border rounded-lg space-y-4 relative">
              <div className="absolute top-2 right-2 flex gap-1">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(exp.id!)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </>
                )}
              </div>

              {isEditing && editData ? (
                <div className="grid grid-cols-2 gap-4 pr-16">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={editData.company} onChange={(e) => setEditData({ ...editData, company: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input value={editData.position} onChange={(e) => setEditData({ ...editData, position: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="month" value={editData.startDate} onChange={(e) => setEditData({ ...editData, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="month" value={editData.endDate} onChange={(e) => setEditData({ ...editData, endDate: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={3} />
                  </div>
                </div>
              ) : (
                <div className="pr-16 space-y-2">
                  <h3 className="font-semibold">{exp.position || "No position"}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-sm text-muted-foreground">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                  )}
                  {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                </div>
              )}
            </div>
          );
        })}

        {isAddingNew ? (
          <div className="p-4 border rounded-lg border-dashed border-primary space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={newExperience.position} onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={newExperience.startDate} onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" value={newExperience.endDate} onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNew} disabled={savingId === "new"}>
                {savingId === "new" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
