import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Loader2, Check, X, ExternalLink } from "lucide-react";

export interface Certification {
  id?: string;
  certification_name: string;
  organization_name: string;
  date_obtained: string;
  url?: string;
}

interface CertificationsSectionProps {
  data: Certification[];
  userId: string;
  onUpdate: (data: Certification[]) => void;
}

import { addCertification, updateCertification, deleteCertification } from "@/services/profileService";

export const CertificationsSection = ({ data, userId, onUpdate }: CertificationsSectionProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Certification | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCertification, setNewCertification] = useState<Certification>({
    certification_name: "",
    organization_name: "",
    date_obtained: "",
    url: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizeDate = (dateStr: string | null): string | null => {
    if (!dateStr || dateStr.length !== 7) return null;
    return dateStr + "-01";
  };

  const validateCertification = (data: Certification) => {
    const issues: string[] = [];
    if (!data.certification_name.trim()) issues.push("Certification name is required");
    if (!data.organization_name.trim()) issues.push("Organization is required");
    if (data.url && !data.url.startsWith('http')) issues.push("URL must start with http/https");
    return issues;
  };

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
      const backendCert = {
        certification_name: editData!.certification_name || '',
        organization_name: editData!.organization_name || '',
        date_obtained: editData!.date_obtained || null,
        url: editData!.url || null
      };
      await updateCertification(editingId, backendCert);
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
      await deleteCertification(id);
      onUpdate(data.filter((c) => c.id !== id));
      toast({ title: "Success", description: "Certification removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

const handleAddNew = async () => {
    const trimmed = {
      ...newCertification,
      certification_name: newCertification.certification_name.trim(),
      organization_name: newCertification.organization_name.trim(),
      url: newCertification.url?.trim() || '',
    };
    const validationErrors = validateCertification(trimmed);
    if (validationErrors.length > 0) {
      const errorObj: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.includes("Certification")) errorObj.certification_name = err;
        else if (err.includes("Organization")) errorObj.organization_name = err;
        else errorObj.url = err;
      });
      setErrors(errorObj);
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }
    
    setErrors({});
    setSavingId("new");
    try {
      const backendCert = {
        certification_name: trimmed.certification_name,
        organization_name: trimmed.organization_name,
        date_obtained: normalizeDate(trimmed.date_obtained) || null,
        url: trimmed.url || null
      };
      const id = await addCertification(userId, backendCert);
      onUpdate([...data, { ...trimmed, id }]);
      setNewCertification({ certification_name: "", organization_name: "", date_obtained: "", url: "" });
      setIsAddingNew(false);
      toast({ title: "Success", description: "Certification added" });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to add certification";
      toast({ title: "Error", description: msg, variant: "destructive" });
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
{data.map((cert, index) => {
          const isEditing = editingId === cert.id;
          const isSaving = savingId === cert.id;
          const isDeleting = deletingId === cert.id;

          return (
            <div key={cert.id ?? index} className="p-4 border rounded-lg space-y-4 relative">

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
                    <Input value={editData.certification_name || ''} onChange={(e) => setEditData({ ...editData!, certification_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input value={editData.organization_name || ''} onChange={(e) => setEditData({ ...editData!, organization_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Obtained</Label>
                    <Input type="month" value={editData.date_obtained || ''} onChange={(e) => setEditData({ ...editData!, date_obtained: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>URL (optional)</Label>
                    <Input value={editData.url || ''} onChange={(e) => setEditData({ ...editData!, url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
              ) : (
                <div className="pr-16 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{cert.certification_name || "No name"}</h3>
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.organization_name}</p>
                  {cert.date_obtained && <p className="text-sm text-muted-foreground">{cert.date_obtained}</p>}
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
                <Input value={newCertification.certification_name} onChange={(e) => setNewCertification({ ...newCertification, certification_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input value={newCertification.organization_name} onChange={(e) => setNewCertification({ ...newCertification, organization_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date Obtained</Label>
                <Input type="month" value={newCertification.date_obtained} onChange={(e) => setNewCertification({ ...newCertification, date_obtained: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <Input value={newCertification.url || ''} onChange={(e) => setNewCertification({ ...newCertification, url: e.target.value })} placeholder="https://..." />
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

