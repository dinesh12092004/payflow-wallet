import { type ReactNode, createContext, useContext, useState } from "react";
import type { Profile } from "../backend";

type Screen =
  | "auth"
  | "home"
  | "send"
  | "topup"
  | "messages"
  | "tasks"
  | "transactions"
  | "admin-login"
  | "admin";

interface AppContextType {
  user: Profile | null;
  setUser: (u: Profile | null) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  adminPassword: string | null;
  setAdminPassword: (p: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [screen, setScreen] = useState<Screen>("auth");
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        screen,
        setScreen,
        adminPassword,
        setAdminPassword,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
