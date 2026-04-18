import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Loader2, Check, X } from "lucide-react";

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationSectionProps {
  data: Education[];
  userId: string;
  onUpdate: (data: Education[]) => void;
}

import { addEducation, updateEducation, deleteEducation } from "@/services/profileService";

export const EducationSection = ({ data, userId, onUpdate }: EducationSectionProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Education | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEducation, setNewEducation] = useState<Education>({
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizeDate = (dateStr: string | null): string | null => {
    if (!dateStr || dateStr.length !== 7) return null;
    return dateStr + "-01";
  };

  const validateEducation = (data: Education) => {
    const issues: string[] = [];
    if (!data.school.trim()) issues.push("School is required");
    if (!data.degree.trim()) issues.push("Degree is required");
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      issues.push("Start date must be before end date");
    }
    return issues;
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id || null);
    setEditData({ ...edu });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData || !editingId) return;
    
    setSavingId(editingId);
    try {
      const backendData = {
        institution_name: editData.school,
        degree: editData.degree,
        field_of_study: editData.field,
start_date: editData.startDate || null,
end_date: editData.endDate || null,
        description: editData.description,
      };
      await updateEducation(editingId!, backendData);
      const updated = data.map((e) => (e.id === editingId ? { ...editData, id: editingId } : e));
      onUpdate(updated);
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
      await deleteEducation(id);
      onUpdate(data.filter((e) => e.id !== id));
      toast({ title: "Success", description: "Education removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    const trimmed = {
      ...newEducation,
      school: newEducation.school.trim(),
      degree: newEducation.degree.trim(),
      field: newEducation.field.trim(),
      description: newEducation.description.trim(),
    };
    const validationErrors = validateEducation(trimmed);
    if (validationErrors.length > 0) {
      const errorObj: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.includes("School")) errorObj.school = err;
        else if (err.includes("Degree")) errorObj.degree = err;
        else if (err.includes("date")) errorObj.endDate = err;
      });
      setErrors(errorObj);
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }
    
    setErrors({});
    setSavingId("new");
    try {
      const backendData = {
        institution_name: trimmed.school,
        degree: trimmed.degree,
        field_of_study: trimmed.field,
        start_date: normalizeDate(trimmed.startDate) || null,
        end_date: normalizeDate(trimmed.endDate) || null,
        description: trimmed.description,
      };
      const newEdu = await addEducation(userId, backendData);
      onUpdate([...data, newEdu]);
      setNewEducation({ school: "", degree: "", field: "", startDate: "", endDate: "", description: "" });
      setIsAddingNew(false);
      toast({ title: "Success", description: "Education added" });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to add education";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>Your educational background</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((edu) => {
          const isEditing = editingId === edu.id;
          const isSaving = savingId === edu.id;
          const isDeleting = deletingId === edu.id;

          return (
            <div key={edu.id} className="p-4 border rounded-lg space-y-4 relative">
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
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(edu.id!)}
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
                    <Label>School/University</Label>
                    <Input value={editData.school} onChange={(e) => setEditData({ ...editData, school: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input value={editData.degree} onChange={(e) => setEditData({ ...editData, degree: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input value={editData.field} onChange={(e) => setEditData({ ...editData, field: e.target.value })} />
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
              )}
            </div>
          );
        })}

        {isAddingNew ? (
          <div className="p-4 border rounded-lg border-dashed border-primary space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School/University</Label>
                <Input value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={newEducation.startDate} onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" value={newEducation.endDate} onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={newEducation.description} onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })} rows={3} />
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
            Add Education
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
