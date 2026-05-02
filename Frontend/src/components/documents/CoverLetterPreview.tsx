import { Card } from "@/components/ui/card";
import type { CoverLetterData } from "./CoverLetterDocument";

interface CoverLetterPreviewProps {
  data: CoverLetterData;
}

export const CoverLetterPreview = ({ data }: CoverLetterPreviewProps) => {
  const content = data?.content?.trim() || "";

  return (
    <Card className="bg-white text-gray-900 p-10 shadow-lg border border-border max-w-[800px] mx-auto min-h-[600px]">
      {content ? (
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
          {content}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <p>Your cover letter content will appear here after generation.</p>
        </div>
      )}
    </Card>
  );
};