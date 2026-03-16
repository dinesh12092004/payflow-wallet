import {
  CheckSquare,
  History,
  Home,
  MessageCircle,
  Send,
  Wallet,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "send", label: "Send", icon: Send },
  { id: "topup", label: "Add", icon: Wallet },
  { id: "messages", label: "Chat", icon: MessageCircle },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "transactions", label: "History", icon: History },
] as const;

export default function BottomNav() {
  const { screen, setScreen } = useApp();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = screen === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-all ${active ? "scale-110" : ""}`}
              />
              <span
                className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}
              >
                {tab.label}
              </span>
              {active && (
                <div className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
