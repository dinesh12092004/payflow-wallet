import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Coins, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useBalance, useSendCoins } from "../hooks/useQueries";

export default function SendMoney() {
  const { user, setScreen } = useApp();
  const { data: balance } = useBalance();
  const sendMutation = useSendCoins();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Payment");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const handleSend = async () => {
    if (!recipient.trim() || !amount || !user) {
      toast.error("Please fill all required fields");
      return;
    }
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      const remaining = await sendMutation.mutateAsync({
        fromUser: user.username,
        toUserName: recipient.trim(),
        amount: amt,
        purpose,
        note: note.trim(),
      });
      setNewBalance(remaining);
      setSuccess(true);
    } catch {
      toast.error("Transfer failed. Check recipient username.");
    }
  };

  if (success) {
    return (
      <div className="phone-frame flex flex-col min-h-dvh items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2
              className="w-10 h-10"
              style={{ color: "oklch(0.55 0.18 145)" }}
            />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Sent!
          </h2>
          <p className="text-muted-foreground mb-1">
            Successfully sent to <strong>{recipient}</strong>
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Remaining balance:{" "}
            <span className="font-bold text-foreground">
              {newBalance} coins
            </span>
          </p>
          <Button
            onClick={() => {
              setSuccess(false);
              setRecipient("");
              setAmount("");
              setNote("");
            }}
            className="gradient-card text-white rounded-2xl w-full"
          >
            Send Another
          </Button>
          <Button
            variant="ghost"
            onClick={() => setScreen("home")}
            className="w-full mt-2"
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

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
          Send Coins
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Coins className="w-5 h-5 coin-gold" />
          <span className="text-white/80 text-sm">
            Balance: {balance ?? user?.coinBalance ?? 0} coins
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl shadow-card p-5 space-y-4"
        >
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Recipient Username *
            </Label>
            <Input
              placeholder="Enter username"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="rounded-xl h-11"
              data-ocid="send.recipient_input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Amount (coins) *
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl h-11"
              data-ocid="send.amount_input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Purpose</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger
                className="rounded-xl h-11"
                data-ocid="send.purpose_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Payment">💳 Payment</SelectItem>
                <SelectItem value="Transfer">🔁 Transfer</SelectItem>
                <SelectItem value="Task Reward">🎯 Task Reward</SelectItem>
                <SelectItem value="Gift">🎁 Gift</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Note (optional)
            </Label>
            <Textarea
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl resize-none"
              rows={2}
              data-ocid="send.note_input"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending}
            className="w-full gradient-card text-white font-semibold rounded-2xl h-12"
            data-ocid="send.submit_button"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
              </>
            ) : (
              "Send Coins"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
