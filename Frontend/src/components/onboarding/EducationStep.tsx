import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Pencil, Trash2, Loader2, Check, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Education, ComponentMode } from "./types";
import { addEducation as addEducationAPI, updateEducation as updateEducationAPI, deleteEducation as deleteEducationAPI } from "@/services/profileService";

interface EducationStepProps {
  education: Education[];
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
  mode?: ComponentMode;
  userId?: string;
  onUpdateList?: (data: Education[]) => void;
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

const mapBackendEducation = (backendEdu: any): Education => ({
  id: String(backendEdu.id ?? ''),
  school: backendEdu.institution_name || '',
  degree: backendEdu.degree || '',
  field: backendEdu.field_of_study || '',
  startDate: extractDateYearMonth(backendEdu.start_date),
  endDate: extractDateYearMonth(backendEdu.end_date),
  description: backendEdu.description || '',
});

// Profile mode: IDs from backend are numeric strings like "123"
// Onboarding mode: IDs are UUIDs from crypto.randomUUID()
const isNewProfileItem = (id: string): boolean => id.startsWith('new_');

export const EducationStep = ({
  education,
  addEducation,
  removeEducation,
  updateEducation,
  mode = "onboarding",
  userId,
  onUpdateList,
}: EducationStepProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Education | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const isProfileMode = mode === "profile";

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    setEditData({ ...edu });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  // ✅ In onboarding, just update local state. In profile, call the API.
  const handleSave = async () => {
    if (!editData || !editingId) return;

    if (!isProfileMode) {
      // Onboarding: update local state only
      updateEducation(editingId, 'school', editData.school);
      updateEducation(editingId, 'degree', editData.degree);
      updateEducation(editingId, 'field', editData.field);
      updateEducation(editingId, 'startDate', editData.startDate);
      updateEducation(editingId, 'endDate', editData.endDate);
      updateEducation(editingId, 'description', editData.description);
      setEditingId(null);
      setEditData(null);
      return;
    }

    if (!userId) return;
    setSavingId(editingId);
    try {
      const backendData = {
        institution_name: editData.school,
        degree: editData.degree,
        field_of_study: editData.field,
        start_date: normalizeDate(editData.startDate) || null,
        end_date: normalizeDate(editData.endDate) || null,
        description: editData.description,
      };
      const result = await updateEducationAPI(editingId, backendData);
      const mappedEducation = result ? mapBackendEducation(result) : editData;
      const updated = education.map((e) => (e.id === editingId ? mappedEducation : e));
      onUpdateList?.(updated);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Education updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  // ✅ In onboarding, just remove from local state. In profile, call the API.
  const handleDelete = async (id: string) => {
    if (!isProfileMode) {
      removeEducation(id);
      return;
    }

    setDeletingId(id);
    try {
      await deleteEducationAPI(id);
      removeEducation(id);
      toast({ title: "Success", description: "Education removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!userId || !isAddingNew) return;

    const newEdu = education.find(e => isNewProfileItem(e.id));
    if (!newEdu || !newEdu.school || !newEdu.degree) return;

    setSavingId("new");
    try {
      const backendData = {
        institution_name: newEdu.school,
        degree: newEdu.degree,
        field_of_study: newEdu.field,
        start_date: normalizeDate(newEdu.startDate) || null,
        end_date: normalizeDate(newEdu.endDate) || null,
        description: newEdu.description,
      };
      const result = await addEducationAPI(userId, backendData);
      const mappedEducation = result ? mapBackendEducation(result) : newEdu;
      const updated = education.map(e => isNewProfileItem(e.id) ? mappedEducation : e);
      onUpdateList?.(updated);
      setIsAddingNew(false);
      toast({ title: "Success", description: "Education added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const startAddNew = () => {
    addEducation();
    setIsAddingNew(true);
  };

  // ✅ KEY FIX: In onboarding, every item is always in form/edit mode.
  // In profile, only items being actively edited or newly added (new_ prefix) show the form.
  const shouldShowForm = (edu: Education): boolean => {
    if (!isProfileMode) return true; // onboarding: always show form
    return editingId === edu.id || isNewProfileItem(edu.id);
  };

  return (
    <div className="space-y-6">
      {!isProfileMode && (
        <div className="text-center mb-6">
          <GraduationCap className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Education</h2>
          <p className="text-muted-foreground">Add your educational background <span className="text-destructive">*</span></p>
        </div>
      )}

      {isProfileMode && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Education</h2>
            <p className="text-muted-foreground">Your educational background</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {education.map((edu) => {
          const isEditing = editingId === edu.id;
          const isSaving = savingId === edu.id;
          const isDeleting = deletingId === edu.id;
          const isNewItem = isNewProfileItem(edu.id);
          const showForm = shouldShowForm(edu);

          // In onboarding, the "active" data is always the edu itself (no editData needed)
          const formData = isProfileMode && isEditing ? editData! : edu;

          return (
            <Card key={edu.id} className="p-4 border-border">
              {showForm ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="School/University"
                      value={formData.school}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, school: e.target.value });
                        } else {
                          updateEducation(edu.id, "school", e.target.value);
                        }
                      }}
                    />
                    <Input
                      placeholder="Degree"
                      value={formData.degree}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, degree: e.target.value });
                        } else {
                          updateEducation(edu.id, "degree", e.target.value);
                        }
                      }}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={formData.field}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, field: e.target.value });
                        } else {
                          updateEducation(edu.id, "field", e.target.value);
                        }
                      }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="month"
                        value={formData.startDate}
                        onChange={(e) => {
                          if (isProfileMode && isEditing) {
                            setEditData({ ...editData!, startDate: e.target.value });
                          } else {
                            updateEducation(edu.id, "startDate", e.target.value);
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
                            updateEducation(edu.id, "endDate", e.target.value);
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
                        updateEducation(edu.id, "description", e.target.value);
                      }
                    }}
                    rows={2}
                  />

                  {/* Profile mode: show Save/Cancel buttons */}
                  {isProfileMode && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        if (isNewItem) {
                          removeEducation(edu.id);
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

                  {/* Onboarding mode: just a Remove button */}
                  {!isProfileMode && (
                    <Button variant="outline" size="sm" onClick={() => handleDelete(edu.id)} className="w-full">
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                // Read-only display (profile mode only, non-editing items)
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div>
                        <h3 className="font-semibold text-base">{edu.school?.trim() || "No institution"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {edu.degree?.trim() || "No degree specified"}{edu.field?.trim() ? ` in ${edu.field}` : ""}
                        </p>
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {edu.startDate?.trim() || "Unknown"} – {edu.endDate?.trim() || "Present"}
                        </p>
                      )}
                      {edu.description?.trim() && <p className="text-sm mt-2 text-foreground">{edu.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(edu.id)}
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
            Add Education
          </Button>
        )
      ) : (
        <Button onClick={addEducation} variant="outline" className="w-full">
          + Add Education
        </Button>
      )}
    </div>
  );
};