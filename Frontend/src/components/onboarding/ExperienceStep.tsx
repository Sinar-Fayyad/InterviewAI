import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Pencil, Trash2, Loader2, Check, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Experience, ComponentMode } from "./types";
import { addExperience as addExperienceAPI, updateExperience as updateExperienceAPI, deleteExperience as deleteExperienceAPI } from "@/services/profileService";

interface ExperienceStepProps {
  experience: Experience[];
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, field: keyof Experience, value: string) => void;
  mode?: ComponentMode;
  userId?: string;
  onUpdateList?: (data: Experience[]) => void;
}

const normalizeDate = (dateStr: string | null): string | null => {
  if (!dateStr || dateStr.length !== 7) return null;
  return dateStr + "-01";
};

const extractDateYearMonth = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string') {
    if (dateStr.length === 7 && dateStr[4] === '-') return dateStr;
    if (dateStr.length >= 10 && dateStr[4] === '-' && dateStr[7] === '-') return dateStr.substring(0, 7);
  }
  return '';
};

const mapBackendExperience = (backendExp: any): Experience => ({
  id: String(backendExp.id || ''),
  company: backendExp.company_name || '',
  position: backendExp.position || '',
  startDate: extractDateYearMonth(backendExp.start_date),
  endDate: extractDateYearMonth(backendExp.end_date),
  description: backendExp.description || '',
});

const isNewProfileItem = (id: string): boolean => id.startsWith('new_');

export const ExperienceStep = ({
  experience,
  addExperience,
  removeExperience,
  updateExperience,
  mode = "onboarding",
  userId,
  onUpdateList,
}: ExperienceStepProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Experience | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const isProfileMode = mode === "profile";

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setEditData({ ...exp });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  // ✅ Onboarding: local state only. Profile: API call.
  const handleSave = async () => {
    if (!editData || !editingId) return;

    if (!isProfileMode) {
      updateExperience(editingId, 'company', editData.company);
      updateExperience(editingId, 'position', editData.position);
      updateExperience(editingId, 'startDate', editData.startDate);
      updateExperience(editingId, 'endDate', editData.endDate);
      updateExperience(editingId, 'description', editData.description);
      setEditingId(null);
      setEditData(null);
      return;
    }

    if (!userId) return;
    setSavingId(editingId);
    try {
      const backendData = {
        company_name: editData.company,
        position: editData.position,
        start_date: normalizeDate(editData.startDate) || null,
        end_date: normalizeDate(editData.endDate) || null,
        description: editData.description,
      };
      const result = await updateExperienceAPI(editingId, backendData);
      const mappedExperience = result ? mapBackendExperience(result) : editData;
      const updated = experience.map((e) => (e.id === editingId ? mappedExperience : e));
      onUpdateList?.(updated);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Experience updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  // ✅ Onboarding: local state only. Profile: API call.
  const handleDelete = async (id: string) => {
    if (!isProfileMode) {
      removeExperience(id);
      return;
    }

    setDeletingId(id);
    try {
      await deleteExperienceAPI(id);
      removeExperience(id);
      toast({ title: "Success", description: "Experience removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!userId || !isAddingNew) return;

    const newExp = experience.find(e => isNewProfileItem(e.id));
    if (!newExp || !newExp.company || !newExp.position) return;

    setSavingId("new");
    try {
      const backendData = {
        company_name: newExp.company,
        position: newExp.position,
        start_date: normalizeDate(newExp.startDate) || null,
        end_date: normalizeDate(newExp.endDate) || null,
        description: newExp.description,
      };
      const result = await addExperienceAPI(userId, backendData);
      const mappedExperience = result ? mapBackendExperience(result) : newExp;
      const updated = experience.map(e => isNewProfileItem(e.id) ? mappedExperience : e);
      onUpdateList?.(updated);
      setIsAddingNew(false);
      toast({ title: "Success", description: "Experience added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const startAddNew = () => {
    addExperience();
    setIsAddingNew(true);
  };

  // ✅ KEY FIX: In onboarding, always show the form.
  const shouldShowForm = (exp: Experience): boolean => {
    if (!isProfileMode) return true;
    return editingId === exp.id || isNewProfileItem(exp.id);
  };

  return (
    <div className="space-y-6">
      {!isProfileMode && (
        <div className="text-center mb-6">
          <Briefcase className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
          <p className="text-muted-foreground">Add your professional experience (optional)</p>
        </div>
      )}

      {isProfileMode && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Work Experience</h2>
            <p className="text-muted-foreground">Your professional experience</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {experience.map((exp) => {
          const isEditing = editingId === exp.id;
          const isSaving = savingId === exp.id;
          const isDeleting = deletingId === exp.id;
          const isNewItem = isNewProfileItem(exp.id);
          const showForm = shouldShowForm(exp);

          const formData = isProfileMode && isEditing ? editData! : exp;

          return (
            <Card key={exp.id} className="p-4 border-border">
              {showForm ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Company"
                      value={formData.company}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, company: e.target.value });
                        } else {
                          updateExperience(exp.id, "company", e.target.value);
                        }
                      }}
                    />
                    <Input
                      placeholder="Position"
                      value={formData.position}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, position: e.target.value });
                        } else {
                          updateExperience(exp.id, "position", e.target.value);
                        }
                      }}
                    />
                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                      <Input
                        type="month"
                        value={formData.startDate}
                        onChange={(e) => {
                          if (isProfileMode && isEditing) {
                            setEditData({ ...editData!, startDate: e.target.value });
                          } else {
                            updateExperience(exp.id, "startDate", e.target.value);
                          }
                        }}
                      />
                      <Input
                        type="month"
                        value={formData.endDate}
                        onChange={(e) => {
                          if (isProfileMode && isEditing) {
                            setEditData({ ...editData!, endDate: e.target.value });
                          } else {
                            updateExperience(exp.id, "endDate", e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => {
                      if (isProfileMode && isEditing) {
                        setEditData({ ...editData!, description: e.target.value });
                      } else {
                        updateExperience(exp.id, "description", e.target.value);
                      }
                    }}
                    rows={3}
                  />

                  {isProfileMode && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        if (isNewItem) {
                          removeExperience(exp.id);
                          setIsAddingNew(false);
                        } else {
                          handleCancelEdit();
                        }
                      }} disabled={isSaving}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={isNewItem ? handleAddNew : handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}

                  {!isProfileMode && (
                    <Button variant="outline" size="sm" onClick={() => handleDelete(exp.id)} className="w-full">
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{exp.position || "No position"}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-sm text-muted-foreground">
                          {exp.startDate} – {exp.endDate || "Present"}
                        </p>
                      )}
                      {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(exp.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {isProfileMode ? (
        isAddingNew ? null : (
          <Button onClick={startAddNew} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        )
      ) : (
        <Button onClick={addExperience} variant="outline" className="w-full">
          + Add Experience
        </Button>
      )}
    </div>
  );
};