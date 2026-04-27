import { create } from 'zustand';
import toast from 'react-hot-toast';
import * as authApi from "@/api/auth";
import { ApiError } from "@/api/http";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zone: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  role: authApi.Role;
  two_fa_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export const AuthStatus = {
  Unknown: 0,
  Authenticated: 1,
  Guest: 2,
} as const;

export type AuthStatusType = typeof AuthStatus[keyof typeof AuthStatus];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: AuthStatusType;
  pending2faTempToken: string | null;
  init: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<{ requires2fa: boolean }>;
  verify2fa: (data: { temp_token: string; code: string }) => Promise<void>;
  registerParticipant: (data: { full_name: string; email: string; phone?: string; password: string }) => Promise<void>;
  registerOrganizer: (data: { full_name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  status: AuthStatus.Unknown,
  pending2faTempToken: null,

  init: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.me();
      set({
        user: res.data as User,
        isAuthenticated: true,
        status: AuthStatus.Authenticated,
        isLoading: false,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        set({
          user: null,
          isAuthenticated: false,
          status: AuthStatus.Guest,
          isLoading: false,
        });
        return;
      }

      set({ isLoading: false, status: AuthStatus.Guest, isAuthenticated: false, user: null });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(data);

      if (res.data && typeof res.data === "object" && "requires_2fa" in res.data) {
        set({
          pending2faTempToken: res.data.temp_token,
          isLoading: false,
          user: null,
          isAuthenticated: false,
          status: AuthStatus.Guest,
        });
        toast.success(res.message || "Code de vérification envoyé par email");
        return { requires2fa: true };
      }

      set({
        user: res.data as User,
        isAuthenticated: true,
        status: AuthStatus.Authenticated,
        isLoading: false,
        pending2faTempToken: null,
      });
      return { requires2fa: false };
    } catch (err) {
      set({ isLoading: false });
      const message = err instanceof Error ? err.message : "Email ou mot de passe incorrect";
      toast.error(message);
      throw err;
    }
  },

  verify2fa: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.verifyLogin2fa(data);
      set({
        user: res.data as User,
        isAuthenticated: true,
        status: AuthStatus.Authenticated,
        isLoading: false,
        pending2faTempToken: null,
      });
      toast.success(res.message || "Connexion réussie");
    } catch (err) {
      set({ isLoading: false });
      const message = err instanceof Error ? err.message : "Code OTP invalide";
      toast.error(message);
      throw err;
    }
  },

  registerParticipant: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "PARTICIPANT",
      });

      set({
        user: res.data as User,
        isAuthenticated: true,
        status: AuthStatus.Authenticated,
        isLoading: false,
      });
      toast.success(res.message || "Compte participant créé avec succès");
    } catch (err) {
      set({ isLoading: false });
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      toast.error(message);
      throw err;
    }
  },

  registerOrganizer: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "ORGANIZER",
      });

      set({
        user: res.data as User,
        isAuthenticated: true,
        status: AuthStatus.Authenticated,
        isLoading: false,
      });
      toast.success(res.message || "Compte organisateur créé avec succès");
    } catch (err) {
      set({ isLoading: false });
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      toast.error(message);
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.logout();
      set({ user: null, isAuthenticated: false, status: AuthStatus.Guest, isLoading: false, pending2faTempToken: null });
      toast.success(res.message || "Déconnexion réussie");
    } catch (err) {
      set({ isLoading: false });
      const message = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      toast.error(message);
      throw err;
    }
  },

  updateUser: async (data) => {
    set({ isLoading: true });
    set((state) => {
      if (!state.user) return state;
      return {
        user: { ...state.user, ...data },
        isLoading: false
      };
    });
    toast.success('Profil mis à jour avec succès !');
  },
}));
