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

// Mock API calls
const mockAddEducation = async (userId: string, edu: Education): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `edu_${Date.now()}`;
};

const mockUpdateEducation = async (id: string, edu: Education): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
};

const mockDeleteEducation = async (id: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return true;
};

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
      await mockUpdateEducation(editingId, editData);
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
      await mockDeleteEducation(id);
      onUpdate(data.filter((e) => e.id !== id));
      toast({ title: "Success", description: "Education removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!newEducation.school.trim()) {
      toast({ title: "Missing Info", description: "Please enter school name", variant: "destructive" });
      return;
    }
    
    setSavingId("new");
    try {
      const id = await mockAddEducation(userId, newEducation);
      onUpdate([...data, { ...newEducation, id }]);
      setNewEducation({ school: "", degree: "", field: "", startDate: "", endDate: "", description: "" });
      setIsAddingNew(false);
      toast({ title: "Success", description: "Education added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add", variant: "destructive" });
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
