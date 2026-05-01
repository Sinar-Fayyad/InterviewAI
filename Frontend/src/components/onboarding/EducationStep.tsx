import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Pencil, Trash2, Loader2, Check, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Education, ComponentMode } from "./types";
import { addEducation, updateEducation, deleteEducation } from "@/services/profileService";

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

const handleSave = async () => {
    if (!editData || !editingId || !userId) return;
    
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
      // Convert string ID to number for backend API
      const backendId = parseInt(editingId, 10);
      await updateEducation(backendId, backendData);
      
      const updated = education.map((e) => (e.id === editingId ? { ...editData } : e));
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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Convert string ID to number for backend API
      const backendId = parseInt(id, 10);
      await deleteEducation(backendId);
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
    
    const newEdu = education.find(e => e.id.startsWith('new_'));
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
      const result = await addEducation(userId, backendData);
      
      // Create updated list with real ID
      const updated = education.map(e => {
        if (e.id.startsWith('new_')) {
          return { ...e, id: result.id || e.id };
        }
        return e;
      });
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
          const isNewItem = edu.id.startsWith('new_');
          
          return (
            <Card key={edu.id} className="p-4 border-border">
              {isEditing || (isNewItem && !isEditing) ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="School/University" 
                      value={isEditing ? editData?.school : edu.school} 
                      onChange={(e) => {
                        if (isEditing) {
                          setEditData({ ...editData!, school: e.target.value });
                        } else {
                          updateEducation(edu.id, "school", e.target.value);
                        }
                      }} 
                    />
                    <Input 
                      placeholder="Degree" 
                      value={isEditing ? editData?.degree : edu.degree} 
                      onChange={(e) => {
                        if (isEditing) {
                          setEditData({ ...editData!, degree: e.target.value });
                        } else {
                          updateEducation(edu.id, "degree", e.target.value);
                        }
                      }} 
                    />
                    <Input 
                      placeholder="Field of Study" 
                      value={isEditing ? editData?.field : edu.field} 
                      onChange={(e) => {
                        if (isEditing) {
                          setEditData({ ...editData!, field: e.target.value });
                        } else {
                          updateEducation(edu.id, "field", e.target.value);
                        }
                      }} 
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="month" 
                        value={isEditing ? editData?.startDate : edu.startDate} 
                        onChange={(e) => {
                          if (isEditing) {
                            setEditData({ ...editData!, startDate: e.target.value });
                          } else {
                            updateEducation(edu.id, "startDate", e.target.value);
                          }
                        }} 
                      />
                      <Input 
                        type="month" 
                        value={isEditing ? editData?.endDate : edu.endDate} 
                        onChange={(e) => {
                          if (isEditing) {
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
                    value={isEditing ? editData?.description : edu.description} 
                    onChange={(e) => {
                      if (isEditing) {
                        setEditData({ ...editData!, description: e.target.value });
                      } else {
                        updateEducation(edu.id, "description", e.target.value);
                      }
                    }} 
                    rows={2} 
                  />
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
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{edu.school || "No school"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {edu.degree}{edu.field && ` in ${edu.field}`}
                      </p>
                      {(edu.startDate || edu.endDate) && (
                        <p className="text-sm text-muted-foreground">
                          {edu.startDate} - {edu.endDate || "Present"}
                        </p>
                      )}
                      {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                    </div>
                    
                    {isProfileMode && (
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
                    )}
                  </div>
                  
                  {!isProfileMode && (
                    <Button variant="outline" size="sm" onClick={() => removeEducation(edu.id)} className="w-full">
                      Remove
                    </Button>
                  )}
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
