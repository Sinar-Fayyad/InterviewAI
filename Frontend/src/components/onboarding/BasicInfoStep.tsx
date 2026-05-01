import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { updateUser } from "@/services/profileService";
import { ComponentMode } from "./types";

interface BasicInfoStepProps {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  setFullName: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setLocation: (v: string) => void;
  setSummary: (v: string) => void;
  mode?: ComponentMode;
  userId?: string;
  onSave?: (data: { full_name: string; email: string; phone: string; location: string; summary: string }) => void;
}

export const BasicInfoStep = ({
  fullName, email, phone, location, summary,
  setFullName, setEmail, setPhone, setLocation, setSummary,
  mode = "onboarding",
  userId,
  onSave,
}: BasicInfoStepProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localData, setLocalData] = useState({
    fullName, email, phone, location, summary
  });

  // Sync local data when props change
  useEffect(() => {
    setLocalData({ fullName, email, phone, location, summary });
  }, [fullName, email, phone, location, summary]);

  const handleSave = async () => {
    if (!userId || mode !== "profile") return;
    
    setSaving(true);
    try {
      const userData = {
        first_name: localData.fullName.split(' ')[0] || '',
        last_name: localData.fullName.split(' ').slice(1).join(' ') || '',
        phone: localData.phone,
        location: localData.location,
        summary: localData.summary,
      };
      await updateUser(userId, userData);
      
      // Update parent state
      setFullName(localData.fullName);
      setPhone(localData.phone);
      setLocation(localData.location);
      setSummary(localData.summary);
      
      setIsEditing(false);
      onSave?.({
        full_name: localData.fullName,
        email: localData.email,
        phone: localData.phone,
        location: localData.location,
        summary: localData.summary
      });
      
      toast({ title: "Success", description: "Basic info updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update basic info", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setLocalData({ fullName, email, phone, location, summary });
    setIsEditing(false);
  };

  const isProfileMode = mode === "profile";

  return (
    <div className="space-y-6">
      {!isProfileMode && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
          <p className="text-muted-foreground">Tell us about yourself</p>
        </div>
      )}
      
      {isProfileMode && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Basic Information</h2>
            <p className="text-muted-foreground">Your personal details</p>
          </div>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name {isProfileMode && <span className="text-destructive">*</span>}
          </Label>
          {isEditing || !isProfileMode ? (
            <Input 
              id="fullName" 
              value={isEditing ? localData.fullName : localData.fullName} 
              onChange={(e) => {
                setLocalData({ ...localData, fullName: e.target.value });
                if (!isEditing && isProfileMode) setFullName(e.target.value);
              }} 
              placeholder="John Doe" 
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {localData.fullName || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center font-mono border border-border/50">
            {localData.email || <span className="text-muted-foreground italic">Not set</span>}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          {isEditing || !isProfileMode ? (
            <Input 
              id="phone" 
              type="tel" 
              value={localData.phone} 
              onChange={(e) => {
                setLocalData({ ...localData, phone: e.target.value });
                if (!isEditing && isProfileMode) setPhone(e.target.value);
              }} 
              placeholder="+1 (555) 123-4567" 
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {localData.phone || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          {isEditing || !isProfileMode ? (
            <Input 
              id="location" 
              value={localData.location} 
              onChange={(e) => {
                setLocalData({ ...localData, location: e.target.value });
                if (!isEditing && isProfileMode) setLocation(e.target.value);
              }} 
              placeholder="New York, USA" 
            />
          ) : (
            <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[40px] flex items-center">
              {localData.location || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        {isEditing || !isProfileMode ? (
          <Textarea 
            id="summary" 
            value={localData.summary} 
            onChange={(e) => {
              setLocalData({ ...localData, summary: e.target.value });
              if (!isEditing && isProfileMode) setSummary(e.target.value);
            }} 
            placeholder="A brief summary of your professional background and career goals..." 
            rows={4} 
          />
        ) : (
          <div className="text-sm py-2 px-3 bg-muted/50 rounded-md max-h-32 overflow-auto min-h-[80px]">
            {localData.summary || <span className="text-muted-foreground italic">Not set</span>}
          </div>
        )}
      </div>
    </div>
  );
};
