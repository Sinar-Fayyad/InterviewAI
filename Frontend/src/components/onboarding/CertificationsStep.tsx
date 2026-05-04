import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Award, Pencil, Trash2, Loader2, Check, X, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Certification, ComponentMode } from "./types";
import { addCertification as addCertificationAPI, updateCertification as updateCertificationAPI, deleteCertification as deleteCertificationAPI } from "@/services/profileService";

interface CertificationsStepProps {
  certifications: Certification[];
  addCertification: () => void;
  removeCertification: (id: string) => void;
  updateCertification: (id: string, field: keyof Certification, value: string) => void;
  mode?: ComponentMode;
  userId?: string;
  onUpdateList?: (data: Certification[]) => void;
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

const mapBackendCertification = (backendCert: any): Certification => ({
  id: String(backendCert.id ?? ''),
  name: backendCert.certification_name || '',
  issuer: backendCert.organization_name || '',
  date: extractDateYearMonth(backendCert.date_obtained),
  url: backendCert.url || '',
});

const isNewProfileItem = (id: string): boolean => id.startsWith('new_');

export const CertificationsStep = ({
  certifications,
  addCertification,
  removeCertification,
  updateCertification,
  mode = "onboarding",
  userId,
  onUpdateList,
}: CertificationsStepProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Certification | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const isProfileMode = mode === "profile";

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setEditData({ ...cert });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  // ✅ Onboarding: local state only. Profile: API call.
  const handleSave = async () => {
    if (!editData || !editingId) return;

    if (!isProfileMode) {
      updateCertification(editingId, 'name', editData.name);
      updateCertification(editingId, 'issuer', editData.issuer);
      updateCertification(editingId, 'date', editData.date);
      updateCertification(editingId, 'url', editData.url);
      setEditingId(null);
      setEditData(null);
      return;
    }

    if (!userId) return;
    setSavingId(editingId);
    try {
      const backendCert = {
        certification_name: editData.name,
        organization_name: editData.issuer,
        date_obtained: normalizeDate(editData.date) || null,
        url: editData.url || null,
      };
      const result = await updateCertificationAPI(editingId, backendCert);
      const mappedCertification = result ? mapBackendCertification(result) : editData;
      const updated = certifications.map((c) => (c.id === editingId ? mappedCertification : c));
      onUpdateList?.(updated);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Success", description: "Certification updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  // ✅ Onboarding: local state only. Profile: API call.
  const handleDelete = async (id: string) => {
    if (!isProfileMode) {
      removeCertification(id);
      return;
    }

    setDeletingId(id);
    try {
      await deleteCertificationAPI(id);
      removeCertification(id);
      toast({ title: "Success", description: "Certification removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!userId || !isAddingNew) return;

    const newCert = certifications.find(c => isNewProfileItem(c.id));
    if (!newCert || !newCert.name || !newCert.issuer) return;

    setSavingId("new");
    try {
      const backendCert = {
        certification_name: newCert.name,
        organization_name: newCert.issuer,
        date_obtained: normalizeDate(newCert.date) || null,
        url: newCert.url || null,
      };
      const result = await addCertificationAPI(userId, backendCert);
      const mappedCertification = result ? mapBackendCertification(result) : newCert;
      const updated = certifications.map(c => isNewProfileItem(c.id) ? mappedCertification : c);
      onUpdateList?.(updated);
      setIsAddingNew(false);
      toast({ title: "Success", description: "Certification added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const startAddNew = () => {
    addCertification();
    setIsAddingNew(true);
  };

  // ✅ KEY FIX: In onboarding, always show the form.
  const shouldShowForm = (cert: Certification): boolean => {
    if (!isProfileMode) return true;
    return editingId === cert.id || isNewProfileItem(cert.id);
  };

  return (
    <div className="space-y-6">
      {!isProfileMode && (
        <div className="text-center mb-6">
          <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Certifications</h2>
          <p className="text-muted-foreground">Add your professional certifications (optional)</p>
        </div>
      )}

      {isProfileMode && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Certifications</h2>
            <p className="text-muted-foreground">Your professional certifications</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {certifications.map((cert) => {
          const isEditing = editingId === cert.id;
          const isSaving = savingId === cert.id;
          const isDeleting = deletingId === cert.id;
          const isNewItem = isNewProfileItem(cert.id);
          const showForm = shouldShowForm(cert);

          const formData = isProfileMode && isEditing ? editData! : cert;

          return (
            <Card key={cert.id} className="p-4 border-border">
              {showForm ? (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Certification Name"
                      value={formData.name}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, name: e.target.value });
                        } else {
                          updateCertification(cert.id, "name", e.target.value);
                        }
                      }}
                    />
                    <Input
                      placeholder="Issuer"
                      value={formData.issuer}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, issuer: e.target.value });
                        } else {
                          updateCertification(cert.id, "issuer", e.target.value);
                        }
                      }}
                    />
                    <Input
                      type="month"
                      value={formData.date}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, date: e.target.value });
                        } else {
                          updateCertification(cert.id, "date", e.target.value);
                        }
                      }}
                    />
                    <Input
                      placeholder="URL (optional)"
                      value={formData.url}
                      onChange={(e) => {
                        if (isProfileMode && isEditing) {
                          setEditData({ ...editData!, url: e.target.value });
                        } else {
                          updateCertification(cert.id, "url", e.target.value);
                        }
                      }}
                    />
                  </div>

                  {isProfileMode && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        if (isNewItem) {
                          removeCertification(cert.id);
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
                    <Button variant="outline" size="sm" onClick={() => handleDelete(cert.id)} className="w-full">
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
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
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cert.id)}
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
            Add Certification
          </Button>
        )
      ) : (
        <Button onClick={addCertification} variant="outline" className="w-full">
          + Add Certification
        </Button>
      )}
    </div>
  );
};