import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Loader2, Check, X, ExternalLink } from "lucide-react";

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface CertificationsSectionProps {
  data: Certification[];
  userId: string;
  onUpdate: (data: Certification[]) => void;
}

// Mock API calls
const mockAddCertification = async (userId: string, cert: Certification): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `cert_${Date.now()}`;
};

const mockUpdateCertification = async (id: string, cert: Certification): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
};

const mockDeleteCertification = async (id: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return true;
};

export const CertificationsSection = ({ data, userId, onUpdate }: CertificationsSectionProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Certification | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCertification, setNewCertification] = useState<Certification>({
    name: "",
    issuer: "",
    date: "",
    url: "",
  });

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id || null);
    setEditData({ ...cert });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData || !editingId) return;
    
    setSavingId(editingId);
    try {
      await mockUpdateCertification(editingId, editData);
      const updated = data.map((c) => (c.id === editingId ? { ...editData, id: editingId } : c));
      onUpdate(updated);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Certification updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await mockDeleteCertification(id);
      onUpdate(data.filter((c) => c.id !== id));
      toast({ title: "Success", description: "Certification removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!newCertification.name.trim()) {
      toast({ title: "Missing Info", description: "Please enter certification name", variant: "destructive" });
      return;
    }
    
    setSavingId("new");
    try {
      const id = await mockAddCertification(userId, newCertification);
      onUpdate([...data, { ...newCertification, id }]);
      setNewCertification({ name: "", issuer: "", date: "", url: "" });
      setIsAddingNew(false);
      toast({ title: "Success", description: "Certification added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
        <CardDescription>Your professional certifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((cert) => {
          const isEditing = editingId === cert.id;
          const isSaving = savingId === cert.id;
          const isDeleting = deletingId === cert.id;

          return (
            <div key={cert.id} className="p-4 border rounded-lg space-y-4 relative">
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
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cert.id!)}
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
                    <Label>Certification Name</Label>
                    <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuer</Label>
                    <Input value={editData.issuer} onChange={(e) => setEditData({ ...editData, issuer: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="month" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>URL (optional)</Label>
                    <Input value={editData.url} onChange={(e) => setEditData({ ...editData, url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
              ) : (
                <div className="pr-16 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{cert.name || "No name"}</h3>
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  {cert.date && <p className="text-sm text-muted-foreground">{cert.date}</p>}
                </div>
              )}
            </div>
          );
        })}

        {isAddingNew ? (
          <div className="p-4 border rounded-lg border-dashed border-primary space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification Name</Label>
                <Input value={newCertification.name} onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input value={newCertification.issuer} onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="month" value={newCertification.date} onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <Input value={newCertification.url} onChange={(e) => setNewCertification({ ...newCertification, url: e.target.value })} placeholder="https://..." />
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
            Add Certification
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
