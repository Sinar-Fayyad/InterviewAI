import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase } from "lucide-react";
import { Experience } from "./types";

interface ExperienceStepProps {
  experience: Experience[];
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, field: keyof Experience, value: string) => void;
}

export const ExperienceStep = ({ experience, addExperience, removeExperience, updateExperience }: ExperienceStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Briefcase className="w-12 h-12 mx-auto mb-2 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
        <p className="text-muted-foreground">Add your professional experience (optional)</p>
      </div>
      <div className="space-y-4">
        {experience.map((exp) => (
          <Card key={exp.id} className="p-4 border-border">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                <Input placeholder="Position" value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} />
                <div className="grid grid-cols-2 gap-2 md:col-span-2">
                  <Input type="month" placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                  <Input type="month" placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                </div>
              </div>
              <Textarea placeholder="Description (optional)" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} rows={3} />
              <Button variant="outline" size="sm" onClick={() => removeExperience(exp.id)} className="w-full">Remove</Button>
            </div>
          </Card>
        ))}
      </div>
      <Button onClick={addExperience} variant="outline" className="w-full">+ Add Experience</Button>
    </div>
  );
};
