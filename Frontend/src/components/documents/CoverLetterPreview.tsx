import { Card } from "@/components/ui/card";
import type { CoverLetterData } from "./CoverLetterDocument";

interface CoverLetterPreviewProps {
  data: CoverLetterData;
}

export const CoverLetterPreview = ({ data }: CoverLetterPreviewProps) => {
  const hasParagraphs = data.paragraphs && data.paragraphs.length > 0;

  return (
    <Card className="bg-white text-gray-900 p-10 shadow-lg border border-border max-w-[800px] mx-auto min-h-[600px]">
      {/* Sender Info */}
      <div className="mb-6">
        <p className="font-semibold text-gray-900">{data.senderName || 'Your Name'}</p>
        {data.senderEmail && <p className="text-sm text-gray-600">{data.senderEmail}</p>}
        {data.senderPhone && <p className="text-sm text-gray-600">{data.senderPhone}</p>}
        {data.senderLocation && <p className="text-sm text-gray-600">{data.senderLocation}</p>}
      </div>

      {/* Date */}
      <p className="text-sm text-gray-600 mb-6">{data.date}</p>

      {/* Recipient Info */}
      <div className="mb-6">
        {data.recipientName && <p className="text-gray-800">{data.recipientName}</p>}
        <p className="text-gray-800">{data.companyName || 'Company Name'}</p>
      </div>

      {/* Subject */}
      <p className="font-semibold text-gray-900 mb-6">
        Re: Application for {data.jobTitle || 'Position'} Position
      </p>

      {/* Salutation */}
      <p className="mb-4 text-gray-800">
        Dear {data.recipientName || 'Hiring Manager'},
      </p>

      {/* Body */}
      {hasParagraphs ? (
        <div className="space-y-4 mb-6">
          {data.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12 mb-6">
          <p>Your cover letter content will appear here after generation.</p>
        </div>
      )}

      {/* Closing */}
      <p className="text-gray-800 mb-8">Sincerely,</p>
      <p className="font-semibold text-gray-900">{data.senderName || 'Your Name'}</p>
    </Card>
  );
};
