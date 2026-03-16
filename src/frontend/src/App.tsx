import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminPortal from "./components/AdminPortal";
import Auth from "./components/Auth";
import BottomNav from "./components/BottomNav";
import Home from "./components/Home";
import Messages from "./components/Messages";
import SendMoney from "./components/SendMoney";
import Tasks from "./components/Tasks";
import TopUp from "./components/TopUp";
import TransactionHistory from "./components/TransactionHistory";
import { AppProvider, useApp } from "./context/AppContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const CUSTOMER_SCREENS = [
  "home",
  "send",
  "topup",
  "messages",
  "tasks",
  "transactions",
];

function AppContent() {
  const { screen } = useApp();

  const showBottomNav = CUSTOMER_SCREENS.includes(screen);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-100 to-background flex justify-center">
      {screen === "auth" && <Auth />}
      {screen === "home" && <Home />}
      {screen === "send" && <SendMoney />}
      {screen === "topup" && <TopUp />}
      {screen === "messages" && <Messages />}
      {screen === "tasks" && <Tasks />}
      {screen === "transactions" && <TransactionHistory />}
      {screen === "admin-login" && <AdminPortal />}
      {screen === "admin" && <AdminPortal />}
      {showBottomNav && <BottomNav />}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
}
