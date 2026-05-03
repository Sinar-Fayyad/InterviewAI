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
  time: string;
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

  /*
    Supports both backend response shapes:

    1. Production:
       {
         payload: [
           { id, from, subject, snippet, body, date, time, url }
         ]
       }

    2. Debug:
       {
         payload: {
           totalFetchedFromGmail: 50,
           totalJobEmails: 5,
           emails: [...]
         }
       }
  */
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
      time: email.time || "",
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



export const saveStarredToStorage = (starredIds: string[]): void => {
  localStorage.setItem("starredMessages", JSON.stringify(starredIds));
};

export const applyStarredState = (messages: Message[]): Message[] => {
  const starredIds = loadStarredFromStorage();

  return messages.map(message => ({
    ...message,
    isStarred: starredIds.includes(message.id),
  }));
};

export const generateAIReply = async (message: Message): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (message.type === "linkedin") {
    return `Hi ${message.from.split(" ")[0]},

Thank you for reaching out and for your kind words about my profile. I appreciate you taking the time to connect.

I would be happy to discuss potential collaboration opportunities and learn more about your work.

Best regards`;
  }

  const subject = message.subject.toLowerCase();
  const content = message.fullContent.toLowerCase();

  if (subject.includes("interview") || content.includes("interview")) {
    return `Dear Hiring Team,

Thank you for reaching out regarding the interview opportunity. I am excited about the possibility of joining your team.

I am available for an interview at your convenience. Please let me know what times work best.

Best regards`;
  }

  if (
    subject.includes("application") ||
    content.includes("application") ||
    subject.includes("recruiter") ||
    content.includes("recruiter")
  ) {
    return `Dear Hiring Team,

Thank you for your message and for the update regarding my application.

I appreciate the opportunity and look forward to hearing more about the next steps.

Best regards`;
  }

  return `Dear ${message.from.split("@")[0]},

Thank you for your message. I have received it and will review the details carefully.

I will get back to you as soon as possible.

Best regards`;
};