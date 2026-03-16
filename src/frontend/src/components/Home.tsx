import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  Coins,
  LogOut,
  MessageCircle,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { useBalance, useTransactions } from "../hooks/useQueries";

function formatDate(ts?: bigint) {
  if (!ts) return "";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function Home() {
  const { user, setUser, setScreen } = useApp();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const recent = (transactions ?? []).slice(-5).reverse();

  const quickActions = [
    {
      id: "send",
      label: "Send",
      icon: Send,
      color: "from-violet-500 to-purple-600",
    },
    {
      id: "topup",
      label: "Add Coins",
      icon: Wallet,
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      color: "from-pink-500 to-rose-600",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      color: "from-amber-500 to-orange-600",
    },
  ] as const;

  return (
    <div className="phone-frame flex flex-col min-h-dvh bottom-safe">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm">Hello,</p>
              <h1 className="text-white font-display font-bold text-xl">
                {user?.username ?? "User"}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setUser(null);
                setScreen("auth");
              }}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-white/70 text-xs mb-1">Coin Balance</p>
            {balanceLoading ? (
              <Skeleton className="h-9 w-32 bg-white/20" />
            ) : (
              <div className="flex items-center gap-2">
                <Coins className="w-7 h-7 coin-gold" />
                <span className="text-4xl font-display font-bold text-white">
                  {(balance ?? user?.coinBalance ?? 0).toLocaleString()}
                </span>
              </div>
            )}
            <p className="text-white/50 text-xs mt-1">{user?.phone}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 -mt-3 space-y-5">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setScreen(action.id)}
                  className="flex flex-col items-center gap-2"
                  data-ocid={`home.${action.id}_button`}
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-card`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Transactions
            </h2>
            <button
              type="button"
              onClick={() => setScreen("transactions")}
              className="text-xs text-primary font-medium"
            >
              View All
            </button>
          </div>

          {txLoading ? (
            <div className="space-y-3" data-ocid="home.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div
              className="bg-card rounded-2xl p-8 text-center shadow-xs"
              data-ocid="home.empty_state"
            >
              <Coins className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No transactions yet
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Start by sending or receiving coins
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((tx, i) => {
                const isSent = tx.fromUser === user?.username;
                return (
                  <div
                    key={tx.id}
                    className="bg-card rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs"
                    data-ocid={`home.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSent ? "bg-destructive/10" : "bg-success/10"
                        }`}
                      >
                        {isSent ? (
                          <TrendingDown
                            className="w-5 h-5"
                            style={{ color: "oklch(0.55 0.22 25)" }}
                          />
                        ) : (
                          <TrendingUp
                            className="w-5 h-5"
                            style={{ color: "oklch(0.55 0.18 145)" }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {isSent ? tx.toUser : tx.fromUser}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.purpose} · {formatDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isSent ? "text-destructive" : ""
                      }`}
                      style={isSent ? {} : { color: "oklch(0.55 0.18 145)" }}
                    >
                      {isSent ? "-" : "+"}
                      {tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
