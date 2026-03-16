import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coins,
  Loader2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useSubmitTopUp, useTopUpRequests } from "../hooks/useQueries";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <Badge
        className="bg-success text-white rounded-full"
        style={{ background: "oklch(0.65 0.20 145)", color: "white" }}
      >
        Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-destructive text-white rounded-full">Rejected</Badge>
    );
  return (
    <Badge
      className="bg-warning rounded-full"
      style={{
        background: "oklch(0.78 0.18 75 / 0.2)",
        color: "oklch(0.45 0.16 75)",
      }}
    >
      Pending
    </Badge>
  );
}

function formatDate(ts?: bigint) {
  if (!ts) return "";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TopUp() {
  const { setScreen } = useApp();
  const submitMutation = useSubmitTopUp();
  const { data: requests, isLoading } = useTopUpRequests();

  const [realAmount, setRealAmount] = useState("");
  const [verificationNote, setVerificationNote] = useState("");

  const coinsAmount = realAmount ? Number(realAmount) : 0;

  const handleSubmit = async () => {
    if (!realAmount || !verificationNote.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    const amt = Number(realAmount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await submitMutation.mutateAsync({
        realAmount: amt,
        coinsRequested: BigInt(amt),
        verificationNote: verificationNote.trim(),
      });
      toast.success("Top-up request submitted! Awaiting verification.");
      setRealAmount("");
      setVerificationNote("");
    } catch {
      toast.error("Failed to submit request.");
    }
  };

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
          Add Coins
        </h1>
        <p className="text-white/70 text-sm mt-1">
          1 real currency = 1 coin (verified)
        </p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl shadow-card p-5 space-y-4"
        >
          <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-3">
            <Coins className="w-8 h-8 coin-gold" />
            <div>
              <p className="text-sm text-muted-foreground">You will receive</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {coinsAmount} Coins
              </p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Real Currency Amount (₹) *
            </Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={realAmount}
              onChange={(e) => setRealAmount(e.target.value)}
              className="rounded-xl h-11"
              data-ocid="topup.amount_input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Coins to Receive
            </Label>
            <Input
              readOnly
              value={coinsAmount || ""}
              placeholder="Auto-filled"
              className="rounded-xl h-11 bg-muted"
              data-ocid="topup.coins_input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Payment Proof / Verification Note *
            </Label>
            <Textarea
              placeholder="e.g., UPI transaction ID: 12345678, sent to 9876543210"
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              data-ocid="topup.note_input"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full gradient-card text-white font-semibold rounded-2xl h-12"
            data-ocid="topup.submit_button"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </motion.div>

        {/* Requests list */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            My Requests
          </h2>
          {isLoading ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="topup.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : !requests || requests.length === 0 ? (
            <div
              className="bg-card rounded-2xl p-6 text-center"
              data-ocid="topup.empty_state"
            >
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req, i) => (
                <div
                  key={req.id}
                  className="bg-card rounded-2xl p-4 shadow-xs"
                  data-ocid={`topup.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        ₹{req.realAmount} → {Number(req.coinsRequested)} coins
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(req.timestamp)}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  {req.status === "approved" && (
                    <div
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "oklch(0.55 0.18 145)" }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Coins added to your
                      wallet
                    </div>
                  )}
                  {req.status === "rejected" && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <XCircle className="w-3 h-3" /> Request rejected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
