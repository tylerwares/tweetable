export type PersonaKey = 'builder' | 'educator' | 'crypto' | 'custom';

export interface GenerationPayload {
  noteId?: string;
  prompt?: string;
  persona: PersonaKey;
  personaBio?: string;
}

export interface Draft {
  id: string;
  content: string;
  persona: PersonaKey;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
