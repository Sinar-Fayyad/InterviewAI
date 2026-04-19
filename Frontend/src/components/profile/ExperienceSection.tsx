import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addExperience, updateExperience, deleteExperience } from "@/services/profileService";
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizeDate = (dateStr: string | null): string | null => {
    if (!dateStr || dateStr.length !== 7) return null;
    return dateStr + "-01";
  };

  const validateExperience = (data: Experience) => {
    const issues: string[] = [];
    if (!data.company.trim()) issues.push("Company is required");
    if (!data.position.trim()) issues.push("Position is required");
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      issues.push("Start date must be before end date");
    }
    if (data.description.trim().length < 10 && data.description.trim()) {
      issues.push("Description should be at least 10 characters");
    }
    return issues;
  };

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
    
    const trimmed = {
      ...editData,
      company: editData.company.trim(),
      position: editData.position.trim(),
      description: editData.description.trim(),
    };
    const validationErrors = validateExperience(trimmed);
    if (validationErrors.length > 0) {
      const errorObj: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.includes("Company")) errorObj.company = err;
        else if (err.includes("Position")) errorObj.position = err;
        else if (err.includes("date")) errorObj.endDate = err;
        else errorObj.description = err;
      });
      setErrors(errorObj);
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }
    
    setErrors({});
    setSavingId(editingId);
    try {
      const backendExp = {
        company_name: trimmed.company,
        position: trimmed.position,
        start_date: normalizeDate(trimmed.startDate) || null,
        end_date: normalizeDate(trimmed.endDate) || null,
        description: trimmed.description,
      };
      await updateExperience(editingId, backendExp);
      const updated = data.map((e) => (e.id === editingId ? { ...trimmed, id: editingId } : e));
      onUpdate(updated);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Experience updated" });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update experience";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };


const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExperience(id);
      onUpdate(data.filter((e) => e.id !== id));
      toast({ title: "Success", description: "Experience removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

const handleAddNew = async () => {
    const trimmed = {
      ...newExperience,
      company: newExperience.company.trim(),
      position: newExperience.position.trim(),
      description: newExperience.description.trim(),
    };
    const validationErrors = validateExperience(trimmed);
    if (validationErrors.length > 0) {
      const errorObj: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.includes("Company")) errorObj.company = err;
        else if (err.includes("Position")) errorObj.position = err;
        else if (err.includes("date")) errorObj.endDate = err;
        else errorObj.description = err;
      });
      setErrors(errorObj);
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }
    
    setErrors({});
    setSavingId("new");
    try {
      const backendExp = {
        company_name: trimmed.company,
        position: trimmed.position,
        start_date: normalizeDate(trimmed.startDate) || null,
        end_date: normalizeDate(trimmed.endDate) || null,
        description: trimmed.description,
      };

      const newExp = await addExperience(userId, backendExp);
      onUpdate([...data, { ...trimmed, id: newExp.id || `exp_${Date.now()}` }]);
      setNewExperience({ company: "", position: "", startDate: "", endDate: "", description: "" });
      setIsAddingNew(false);
      toast({ title: "Success", description: "Experience added" });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to add experience";
      toast({ title: "Error", description: msg, variant: "destructive" });
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
                <Input 
                  value={newExperience.company} 
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, company: e.target.value });
                    if (errors.company) setErrors({ ...errors, company: '' });
                  }} 
                  className={errors.company ? "border-destructive" : ""}
                />
                {errors.company && <p className="text-destructive text-xs mt-1">{errors.company}</p>}
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input 
                  value={newExperience.position} 
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, position: e.target.value });
                    if (errors.position) setErrors({ ...errors, position: '' });
                  }} 
                  className={errors.position ? "border-destructive" : ""}
                />
                {errors.position && <p className="text-destructive text-xs mt-1">{errors.position}</p>}
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="month" 
                  value={newExperience.startDate} 
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, startDate: e.target.value });
                    if (errors.startDate) setErrors({ ...errors, startDate: '' });
                  }} 
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && <p className="text-destructive text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="month" 
                  value={newExperience.endDate} 
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, endDate: e.target.value });
                    if (errors.endDate) setErrors({ ...errors, endDate: '' });
                  }} 
                  className={errors.endDate ? "border-destructive" : ""}
                />
                {errors.endDate && <p className="text-destructive text-xs mt-1">{errors.endDate}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newExperience.description} 
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }} 
                  rows={3}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
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
