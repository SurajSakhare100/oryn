export type Role = "user" | "assistant";

export interface Source {
  id: number;
  title: string;
  url: string;
  description: string;
  favicon: string;
}

export interface RelatedQuestion {
  id: number;
  text: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  sources?: Source[];
  relatedQuestions?: RelatedQuestion[];
  thinking?: string[];
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export type ThinkingStep =
  | "Searching web..."
  | "Reading sources..."
  | "Generating answer...";
