// Inbox service for filtering, starring, and mock reply generation

export interface Message {
  id: number;
  type: "email" | "linkedin";
  from: string;
  subject: string;
  preview: string;
  fullContent: string;
  priority: "high" | "medium" | "low";
  isSpam: boolean;
  isStarred: boolean;
  time: string;
  date: string;
}

// Initial mock messages
export const initialMessages: Message[] = [
  {
    id: 1,
    type: "email",
    from: "recruiter@techcorp.com",
    subject: "Interview Opportunity - Senior Developer",
    preview: "We're impressed with your background and would like to schedule an interview...",
    fullContent: "Dear Candidate,\n\nWe're impressed with your background and would like to schedule an interview for the Senior Developer position at TechCorp.\n\nYour experience aligns perfectly with what we're looking for, and we believe you could be a great addition to our team.\n\nPlease let us know your availability for next week.\n\nBest regards,\nHR Team at TechCorp",
    priority: "high",
    isSpam: false,
    isStarred: false,
    time: "2 hours ago",
    date: "2024-01-15",
  },
  {
    id: 2,
    type: "linkedin",
    from: "John Smith",
    subject: "Great profile! Let's connect",
    preview: "I noticed we share similar interests in AI and would love to connect...",
    fullContent: "Hi there!\n\nI noticed we share similar interests in AI and machine learning. I've been following your work and would love to connect and perhaps discuss some collaboration opportunities.\n\nI'm currently leading an AI team at InnovateTech and always looking for talented individuals to network with.\n\nLooking forward to connecting!\n\nBest,\nJohn Smith\nHead of AI at InnovateTech",
    priority: "medium",
    isSpam: false,
    isStarred: false,
    time: "5 hours ago",
    date: "2024-01-15",
  },
  {
    id: 3,
    type: "email",
    from: "notifications@platform.com",
    subject: "Your account statement is ready",
    preview: "View your monthly account statement and activity summary...",
    fullContent: "Hello,\n\nYour monthly account statement for January 2024 is now ready for review.\n\nYou can view your complete activity summary, transactions, and account balance by logging into your account.\n\nIf you have any questions, please don't hesitate to contact our support team.\n\nThank you for being a valued customer.\n\nBest regards,\nPlatform Support Team",
    priority: "low",
    isSpam: false,
    isStarred: false,
    time: "1 day ago",
    date: "2024-01-14",
  },
  {
    id: 4,
    type: "email",
    from: "spam@fake.com",
    subject: "You've won $1,000,000!",
    preview: "Click here to claim your prize...",
    fullContent: "Congratulations! You've been selected as the winner of our grand prize of $1,000,000! Click here immediately to claim your prize before it expires!\n\nThis is a limited time offer!",
    priority: "low",
    isSpam: true,
    isStarred: false,
    time: "2 days ago",
    date: "2024-01-13",
  },
];

// Filter messages based on criteria
export const filterMessages = (
  messages: Message[],
  searchQuery: string,
  showStarredOnly: boolean,
  type?: "email" | "linkedin" | "spam" | "all"
): Message[] => {
  let filtered = [...messages];

  // Filter by starred
  if (showStarredOnly) {
    filtered = filtered.filter(m => m.isStarred);
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      m =>
        m.subject.toLowerCase().includes(query) ||
        m.from.toLowerCase().includes(query) ||
        m.preview.toLowerCase().includes(query)
    );
  }

  // Filter by type
  if (type === "email") {
    filtered = filtered.filter(m => m.type === "email" && !m.isSpam);
  } else if (type === "linkedin") {
    filtered = filtered.filter(m => m.type === "linkedin" && !m.isSpam);
  } else if (type === "spam") {
    filtered = filtered.filter(m => m.isSpam);
  } else if (type === "all") {
    filtered = filtered.filter(m => !m.isSpam);
  }

  return filtered;
};

// Toggle star status for a message
export const toggleStar = (messages: Message[], messageId: number): Message[] => {
  return messages.map(m =>
    m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
  );
};

// Generate AI reply based on message context
export const generateAIReply = async (message: Message): Promise<string> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate context-aware professional reply based on message type and content
  if (message.type === "linkedin") {
    return `Hi ${message.from.split(" ")[0]},

Thank you for reaching out and for your kind words about my profile! I appreciate you taking the time to connect.

I'm always excited to network with professionals who share similar interests. I'd be happy to discuss potential collaboration opportunities and learn more about your work.

Would you be available for a brief call next week to explore how we might work together?

Looking forward to connecting!

Best regards`;
  }

  if (message.subject.toLowerCase().includes("interview")) {
    return `Dear Hiring Team,

Thank you for reaching out regarding the interview opportunity. I am very excited about the possibility of joining your team.

I am available for an interview at your earliest convenience. Please let me know what times work best for you, and I will adjust my schedule accordingly.

I look forward to discussing how my skills and experience can contribute to your organization.

Best regards`;
  }

  return `Dear ${message.from.split("@")[0]},

Thank you for your message. I have received it and will review the details carefully.

I will get back to you with a more detailed response as soon as possible.

Best regards`;
};

// Load starred messages from localStorage
export const loadStarredFromStorage = (): number[] => {
  try {
    const stored = localStorage.getItem("starredMessages");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save starred messages to localStorage
export const saveStarredToStorage = (starredIds: number[]): void => {
  localStorage.setItem("starredMessages", JSON.stringify(starredIds));
};
