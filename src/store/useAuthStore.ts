import { create } from 'zustand';
import { UserProfile, Organization } from '../types';
import { INITIAL_USER, INITIAL_ORGANIZATIONS } from '../services/mockData';

interface AuthState {
  user: UserProfile | null;
  organizations: Organization[];
  activeOrg: Organization;
  isAuthenticated: boolean;
  is2FAWaiting: boolean;
  pending2FAEmail: string | null;
  login: (email: string, pass: string) => Promise<{ requires2FA: boolean }>;
  verify2FA: (code: string) => boolean;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggle2FA: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: INITIAL_USER,
  organizations: INITIAL_ORGANIZATIONS,
  activeOrg: INITIAL_ORGANIZATIONS[0],
  isAuthenticated: true, // starts logged in with demo surveyor account for immediate testing
  is2FAWaiting: false,
  pending2FAEmail: null,

  login: async (email: string) => {
    // Simulate real auth check
    if (email) {
      set({ is2FAWaiting: true, pending2FAEmail: email });
      return { requires2FA: true };
    }
    return { requires2FA: false };
  },

  verify2FA: (code: string) => {
    // Accept valid 6-digit test code (or standard "123456")
    if (code.length === 6) {
      set({
        isAuthenticated: true,
        is2FAWaiting: false,
        pending2FAEmail: null,
        user: INITIAL_USER,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      is2FAWaiting: false,
    });
  },

  switchOrganization: (orgId: string) => {
    const org = get().organizations.find((o) => o.id === orgId);
    if (org) {
      set({
        activeOrg: org,
        user: get().user ? { ...get().user!, organizationId: org.id } : null,
      });
    }
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  toggle2FA: (enabled) => {
    set((state) => ({
      user: state.user ? { ...state.user, twoFactorEnabled: enabled } : null,
    }));
  },
}));
