import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { useTransactions } from "../hooks/useQueries";

function formatDate(ts?: bigint) {
  if (!ts) return "";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const purposeColors: Record<string, string> = {
  Payment: "bg-blue-100 text-blue-700",
  Transfer: "bg-purple-100 text-purple-700",
  "Task Reward": "bg-amber-100 text-amber-700",
  Gift: "bg-pink-100 text-pink-700",
};

export default function TransactionHistory() {
  const { user, setScreen } = useApp();
  const { data: transactions, isLoading } = useTransactions();

  const sorted = [...(transactions ?? [])].reverse();

  return (
    <div className="phone-frame flex flex-col min-h-dvh bottom-safe">
      <div className="gradient-header px-5 pt-12 pb-6">
        <button
          type="button"
          onClick={() => setScreen("home")}
          className="text-white/80 hover:text-white mb-4 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-display font-bold text-white">
          Transaction History
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {sorted.length} transactions
        </p>
      </div>

      <div className="flex-1 px-4 py-5">
        {isLoading ? (
          <div
            className="text-center py-12"
            data-ocid="transactions.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="bg-card rounded-2xl p-10 text-center"
            data-ocid="transactions.empty_state"
          >
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((tx, i) => {
              const isSent = tx.fromUser === user?.username;
              const purposeClass =
                purposeColors[tx.purpose] ?? "bg-gray-100 text-gray-700";
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="bg-card rounded-2xl px-4 py-3 shadow-xs"
                  data-ocid={`transactions.item.${i + 1}`}
                >
                  <div className="flex items-center justify-between">
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
                          {isSent ? `To: ${tx.toUser}` : `From: ${tx.fromUser}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            className={`text-[10px] px-1.5 py-0 rounded-full h-4 ${purposeClass}`}
                          >
                            {tx.purpose}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(tx.timestamp)}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                            {tx.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: isSent
                          ? "oklch(0.55 0.22 25)"
                          : "oklch(0.55 0.18 145)",
                      }}
                    >
                      {isSent ? "-" : "+"}
                      {tx.amount}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
