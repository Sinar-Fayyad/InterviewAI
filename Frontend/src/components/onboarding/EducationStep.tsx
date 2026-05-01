import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap } from "lucide-react";
import { Education } from "./types";

interface EducationStepProps {
  education: Education[];
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
}

export const EducationStep = ({ education, addEducation, removeEducation, updateEducation }: EducationStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="w-12 h-12 mx-auto mb-2 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Education</h2>
        <p className="text-muted-foreground">Add your educational background <span className="text-destructive">*</span></p>
      </div>
      <div className="space-y-4">
        {education.map((edu) => (
          <Card key={edu.id} className="p-4 border-border">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="School/University" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                <Input placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="month" placeholder="Start Date" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                  <Input type="month" placeholder="End Date" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                </div>
              </div>
              <Textarea placeholder="Description (optional)" value={edu.description} onChange={(e) => updateEducation(edu.id, "description", e.target.value)} rows={2} />
              <Button variant="outline" size="sm" onClick={() => removeEducation(edu.id)} className="w-full">Remove</Button>
            </div>
          </Card>
        ))}
      </div>
      <Button onClick={addEducation} variant="outline" className="w-full">+ Add Education</Button>
    </div>
  );
};
