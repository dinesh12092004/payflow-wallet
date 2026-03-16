import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import {
  useConversation,
  useMessages,
  useSendMessage,
} from "../hooks/useQueries";

function formatTime(ts?: bigint) {
  if (!ts) return "";
  return new Date(Number(ts) / 1_000_000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Conversation({
  otherUser,
  onBack,
}: { otherUser: string; onBack: () => void }) {
  const { user } = useApp();
  const { data: msgs, isLoading } = useConversation(otherUser);
  const sendMsg = useSendMessage();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await sendMsg.mutateAsync({
        toUsername: otherUser,
        content: input.trim(),
      });
      setInput("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="phone-frame flex flex-col min-h-dvh">
      <div className="gradient-header px-5 pt-12 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="text-white/80 hover:text-white mb-3 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-display font-bold text-white">
          {otherUser}
        </h1>
      </div>

      <div
        className="flex-1 px-4 py-4 overflow-y-auto space-y-3"
        style={{ paddingBottom: "5rem" }}
      >
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !msgs || msgs.length === 0 ? (
          <div className="text-center py-16" data-ocid="messages.empty_state">
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          msgs.map((msg) => {
            const isMe = msg.fromUser === user?.username;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "gradient-card text-white rounded-br-sm"
                      : "bg-card shadow-xs text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.note}</p>
                  <p
                    className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-2xl h-11 flex-1"
            data-ocid="messages.message_input"
          />
          <Button
            onClick={handleSend}
            disabled={sendMsg.isPending || !input.trim()}
            className="gradient-card text-white rounded-2xl h-11 w-11 p-0"
            data-ocid="messages.send_button"
          >
            {sendMsg.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const { user, setScreen } = useApp();
  const { data: messages, isLoading } = useMessages();
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [newChat, setNewChat] = useState("");

  if (activeConvo) {
    return (
      <Conversation
        otherUser={activeConvo}
        onBack={() => setActiveConvo(null)}
      />
    );
  }

  // Derive unique conversations
  const conversations = messages
    ? [
        ...new Set(
          messages.map((m) =>
            m.fromUser === user?.username ? m.toUser : m.fromUser,
          ),
        ),
      ]
    : [];

  const lastMsgFor = (other: string) =>
    messages
      ?.filter((m) => m.fromUser === other || m.toUser === other)
      .slice(-1)[0];

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
        <h1 className="text-2xl font-display font-bold text-white">Messages</h1>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* New Chat */}
        <div className="bg-card rounded-2xl p-4 shadow-xs">
          <p className="text-sm font-medium text-foreground mb-2">
            Start New Chat
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter username..."
              value={newChat}
              onChange={(e) => setNewChat(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                newChat.trim() &&
                setActiveConvo(newChat.trim())
              }
              className="rounded-xl h-10 flex-1"
            />
            <Button
              onClick={() => newChat.trim() && setActiveConvo(newChat.trim())}
              className="gradient-card text-white rounded-xl h-10"
            >
              Chat
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Conversations
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div
              className="bg-card rounded-2xl p-8 text-center"
              data-ocid="messages.empty_state"
            >
              <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((convo, i) => {
                const last = lastMsgFor(convo);
                return (
                  <motion.button
                    key={convo}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveConvo(convo)}
                    className="w-full bg-card rounded-2xl p-4 flex items-center gap-3 shadow-xs mb-2 hover:shadow-card transition-shadow text-left"
                    data-ocid={`messages.item.${i + 1}`}
                  >
                    <div className="w-11 h-11 gradient-card rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {convo[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        {convo}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {last?.note ?? ""}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
