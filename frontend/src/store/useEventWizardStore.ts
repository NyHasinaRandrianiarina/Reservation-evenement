import { create } from "zustand";
import type { EventCategory, EventLocation } from "@/types/event";

export type TicketType = {
  id: string;
  name: string;
  type: "free" | "paid";
  price: number;
  quota: number | null; // null means unlimited
  description: string;
  limitPerOrder: number;
};

export type CustomField = {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "checkbox";
  required: boolean;
  options?: string[]; // Used if type is "select"
};

export type EventDraft = {
  title: string;
  category: EventCategory | "other";
  description: string;
  startDate: string;
  endDate: string;
  location: EventLocation;
  capacity: number | null;
  isPrivate: boolean;
  coverImage: File | null;
  coverImageUrl?: string; // Preview URL
  
  tickets: TicketType[];
  customFields: CustomField[];
};

interface EventWizardState {
  draft: EventDraft;
  updateDraft: (data: Partial<EventDraft>) => void;
  resetDraft: () => void;
}

const defaultDraft: EventDraft = {
  title: "",
  category: "other",
  description: "",
  startDate: "",
  endDate: "",
  location: {
    type: "in_person",
    address: "",
    onlineUrl: "",
  },
  capacity: null,
  isPrivate: false,
  coverImage: null,
  tickets: [],
  customFields: [],
};

export const useEventWizardStore = create<EventWizardState>((set) => ({
  draft: { ...defaultDraft },
  updateDraft: (data) =>
    set((state) => ({
      draft: { ...state.draft, ...data },
    })),
  resetDraft: () => set({ draft: { ...defaultDraft } }),
}));
