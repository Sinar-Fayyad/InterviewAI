import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Building2, MapPin, Calendar, ExternalLink, Edit, Trash2 } from "lucide-react";
import { getApplications, addApplication, updateApplication, deleteApplication } from "@/services/applicationService";
import type { Application } from "@/types/database";

type ApplicationStatus = "saved" | "applied" | "interviewing" | "offered" | "rejected";

type JobApplication = Application;

const statusColors: Record<ApplicationStatus, string> = {
  saved: "bg-muted text-muted-foreground",
  applied: "bg-primary/20 text-primary",
  interviewing: "bg-accent/20 text-accent",
  offered: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
};

const ApplicationTracker = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");
const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    job_description: "",
    job_url: "",
    salary_range: "",
    location: "",
    status: "saved" as ApplicationStatus,
    applied_at: "",
    notes: "",
    contact_name: "",
    contact_email: "",
  });

  useEffect(() => {
    if (userId) fetchApps();
  }, [userId]);

  const fetchApps = async () => {
    if (!userId) return;
    try {
      const data = await getApplications(userId);
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

const getAppliedAt = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!formData.job_title.trim() || !formData.company_name.trim()) {
      toast({ title: "Validation Error", description: "Job Title and Company are required", variant: "destructive" });
      return;
    }

const appliedAt = formData.applied_at || getAppliedAt();
    const backendData = {
      job_title: formData.job_title,
      company_name: formData.company_name,
      location: formData.location || '',
      salary_range: formData.salary_range || '',
      job_url: formData.job_url || '',
      job_description: formData.job_description || '',
      contact_name: formData.contact_name || '',
      contact_email: formData.contact_email || '',
      applied_at: appliedAt,
      notes: formData.notes || '',
      status: formData.status,
    };

    try {
      if (editingApp) {
        await updateApplication(editingApp.id, backendData);
        toast({ title: "Updated", description: "Application updated successfully" });
      } else {
        await addApplication(userId, backendData);
        toast({ title: "Added", description: "Application added successfully" });
      }
      setDialogOpen(false);
      setEditingApp(null);
      resetForm();
      fetchApps();
    } catch (error: any) {
      console.error("Error saving application:", error);
      const message = error.response?.data?.message || "Failed to save application";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      job_title: app.job_title,
      company_name: app.company_name || "",
      job_description: app.job_description || "",
      job_url: app.job_url || "",
      salary_range: app.salary_range || "",
      location: app.location || "",
      status: (app.status as ApplicationStatus) || "saved",
      applied_at: app.applied_at || "",
      notes: app.notes || "",
      contact_name: app.contact_name || "",
      contact_email: app.contact_email || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      setApplications(applications.filter(a => a.id !== id));
      toast({ title: "Deleted", description: "Application removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete application", variant: "destructive" });
    }
  };

const resetForm = () => {
    setFormData({
      job_title: "",
      company_name: "",
      job_description: "",
      job_url: "",
      salary_range: "",
      location: "",
      status: "saved" as ApplicationStatus,
      applied_at: "",
      notes: "",
      contact_name: "",
      contact_email: "",
    });
  };

  const filteredApplications = filterStatus === "all"
    ? applications
    : applications.filter(a => (a.status as ApplicationStatus) === filterStatus);

  const stats = {
    total: applications.length,
    applied: applications.filter(a => (a.status as ApplicationStatus) === "applied").length,
    interviewing: applications.filter(a => (a.status as ApplicationStatus) === "interviewing").length,
    offered: applications.filter(a => (a.status as ApplicationStatus) === "offered").length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <BackButton className="mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <span className="text-sm font-medium">Application Tracker</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
              <p className="text-muted-foreground">Manage and track your job applications</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingApp(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingApp ? "Edit Application" : "Add New Application"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Remote, NYC, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Salary Range</Label>
                      <Input
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        placeholder="$100k - $150k"
                      />
                    </div>
                  </div>
<div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job URL</Label>
                      <Input
                        type="url"
                        value={formData.job_url}
                        onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
<Label>Applied Date</Label>
                      <Input
                        type="date"
                        value={formData.applied_at}
                        onChange={(e) => setFormData({ ...formData, applied_at: e.target.value })}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v as ApplicationStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saved">Saved</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="interviewing">Interviewing</SelectItem>
                          <SelectItem value="offered">Offer</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Job Description</Label>
                    <Textarea
                      value={formData.job_description}
                      onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingApp ? "Update" : "Add"} Application
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </Card>
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.applied}</p>
              <p className="text-sm text-muted-foreground">Applied</p>
            </Card>
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.interviewing}</p>
              <p className="text-sm text-muted-foreground">Interviewing</p>
            </Card>
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.offered}</p>
              <p className="text-sm text-muted-foreground">Offers</p>
            </Card>
          </div>

          <div className="mb-6">
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ApplicationStatus | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your job applications</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="bg-secondary/80 border-primary/20 shadow-card p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{app.job_title}</h3>
                        <Badge className={statusColors[app.status as ApplicationStatus]}>
                          {(app.status as string).charAt(0).toUpperCase() + (app.status as string).slice(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {app.company_name}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {app.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {app.salary_range && (
                        <p className="text-sm text-primary mt-2">{app.salary_range}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.job_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(app)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(app.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ApplicationTracker;
