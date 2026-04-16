import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2 } from "lucide-react";

interface BasicInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface BasicInfoSectionProps {
  data: BasicInfo;
  userId: string;
  onUpdate: (data: BasicInfo) => void;
}

// Mock API call
const mockUpdateUser = async (userId: string, data: BasicInfo): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return true;
};

export const BasicInfoSection = ({ data, userId, onUpdate }: BasicInfoSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<BasicInfo>(data);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API: POST /api/v0.1/update_user/{id}
      const success = await mockUpdateUser(userId, editData);
      if (success) {
        onUpdate(editData);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Basic info updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update basic info",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setEditData(data);
    setIsEditing(true);
  };

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Your personal details</CardDescription>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="absolute top-4 right-4"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="absolute top-4 right-4"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          {isEditing ? (
            <Input
              id="full_name"
              value={editData.full_name}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {data.full_name || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {data.email || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          {isEditing ? (
            <Input
              id="phone"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {data.phone || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          {isEditing ? (
            <Input
              id="location"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {data.location || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          {isEditing ? (
            <Textarea
              id="summary"
              value={editData.summary}
              onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
              rows={4}
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[80px]">
              {data.summary || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
