import { create } from 'zustand';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createAccount?: boolean;
  password?: string;
}

export interface AttendeeInfo {
  ticketId: string;
  firstName: string;
  lastName: string;
  email?: string;
  // Dynamic fields could go here in the future
}

interface RegistrationState {
  eventSlug: string | null;
  tickets: Record<string, number>; // ticketId -> quantity
  contact: ContactInfo | null;
  attendees: AttendeeInfo[];
  
  // Actions
  initRegistration: (slug: string, initialTickets: Record<string, number>) => void;
  updateTickets: (tickets: Record<string, number>) => void;
  updateContact: (contact: ContactInfo) => void;
  updateAttendees: (attendees: AttendeeInfo[]) => void;
  clearRegistration: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  eventSlug: null,
  tickets: {},
  contact: null,
  attendees: [],
  
  initRegistration: (slug, initialTickets) => set({ 
    eventSlug: slug, 
    tickets: initialTickets,
    // We don't clear contact/attendees yet in case they are just adjusting tickets
  }),
  
  updateTickets: (tickets) => set({ tickets }),
  
  updateContact: (contact) => set({ contact }),
  
  updateAttendees: (attendees) => set({ attendees }),
  
  clearRegistration: () => set({
    eventSlug: null,
    tickets: {},
    contact: null,
    attendees: [],
  }),
}));
