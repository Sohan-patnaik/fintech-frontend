import { create } from "zustand";

interface AuthState {
  token: string | null;
  isAuth: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuth: false,
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuth: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, isAuth: false });
  },
  init: () => {
    const token = localStorage.getItem("token");
    if (token) set({ token, isAuth: true });
  },
}));
