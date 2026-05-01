import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Award } from "lucide-react";
import { Certification } from "./types";

interface CertificationsStepProps {
  certifications: Certification[];
  addCertification: () => void;
  removeCertification: (id: string) => void;
  updateCertification: (id: string, field: keyof Certification, value: string) => void;
}

export const CertificationsStep = ({ certifications, addCertification, removeCertification, updateCertification }: CertificationsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Certifications</h2>
        <p className="text-muted-foreground">Add your professional certifications (optional)</p>
      </div>
      <div className="space-y-4">
        {certifications.map((cert) => (
          <Card key={cert.id} className="p-4 border-border">
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Certification Name" value={cert.name} onChange={(e) => updateCertification(cert.id, "name", e.target.value)} />
                <Input placeholder="Issuer" value={cert.issuer} onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)} />
                <Input type="month" placeholder="Date" value={cert.date} onChange={(e) => updateCertification(cert.id, "date", e.target.value)} />
                <Input placeholder="URL (optional)" value={cert.url} onChange={(e) => updateCertification(cert.id, "url", e.target.value)} />
              </div>
              <Button variant="outline" size="sm" onClick={() => removeCertification(cert.id)} className="w-full">Remove</Button>
            </div>
          </Card>
        ))}
      </div>
      <Button onClick={addCertification} variant="outline" className="w-full">+ Add Certification</Button>
    </div>
  );
};
