import api from "@/services/api";
export interface Message {
  id: string;
  type: "email";
  from: string;
  subject: string;
  preview: string;
  fullContent: string;
  priority: "high" | "medium" | "low";
  isSpam: boolean;
  date: string;
  url?: string;
  matched_keyword?: string;
}

const getPriority = (subject: string, body: string): "high" | "medium" | "low" => {
  const text = `${subject} ${body}`.toLowerCase();

  if (
    text.includes("interview") ||
    text.includes("offer") ||
    text.includes("assessment") ||
    text.includes("next steps") ||
    text.includes("selected") ||
    text.includes("congratulations") ||
    text.includes("technical interview") ||
    text.includes("screening call") ||
    text.includes("phone screen")
  ) {
    return "high";
  }

  if (
    text.includes("application") ||
    text.includes("recruiter") ||
    text.includes("recruitment") ||
    text.includes("hiring") ||
    text.includes("position") ||
    text.includes("role") ||
    text.includes("candidate")
  ) {
    return "medium";
  }

  return "low";
};

export const getJobEmails = async (userId: string): Promise<Message[]> => {
  const { data } = await api.get(`/get_job_emails/${userId}`);
  const payload = data?.payload ?? data;

  const emails = Array.isArray(payload)
    ? payload
    : payload?.emails ?? [];

  return emails.map((email: any): Message => {
    const subject = email.subject || "No Subject";
    const body = email.body || email.fullContent || email.snippet || "";
    const snippet = email.snippet || body.slice(0, 120);

    return {
      id: String(email.id),
      type: "email",
      from: email.from || "Unknown Sender",
      subject,
      preview: snippet,
      fullContent: body,
      priority: getPriority(subject, body),
      isSpam: false,
      date: email.date || "",
      url: email.url,
      matched_keyword: email.matched_keyword,
    };
  });
};

export const filterMessages = (
  messages: Message[],
  searchQuery: string,
  type?: "email" | "spam" | "all"
): Message[] => {
  let filtered = [...messages];

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();

    filtered = filtered.filter(message =>
      message.subject.toLowerCase().includes(query) ||
      message.from.toLowerCase().includes(query) ||
      message.preview.toLowerCase().includes(query) ||
      message.fullContent.toLowerCase().includes(query)
    );
  }

  if (type === "email") {
    filtered = filtered.filter(message => message.type === "email" && !message.isSpam);
  } else if (type === "spam") {
    filtered = filtered.filter(message => message.isSpam);
  } else if (type === "all") {
    filtered = filtered.filter(message => !message.isSpam);
  }

  return filtered;
};
