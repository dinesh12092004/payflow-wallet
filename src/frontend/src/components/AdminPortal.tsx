import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LogOut,
  MessageSquare,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import {
  useAdminLogin,
  useAdminMessages,
  useAdminTopUpRequests,
  useAdminTransactions,
  useAdminUsers,
} from "../hooks/useQueries";

function formatDate(ts?: bigint) {
  if (!ts) return "";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AdminDashboard({ adminPassword }: { adminPassword: string }) {
  const { setScreen, setAdminPassword } = useApp();
  const { data: users } = useAdminUsers(adminPassword);
  const { data: transactions } = useAdminTransactions(adminPassword);
  const { data: messages } = useAdminMessages(adminPassword);
  const {
    data: topups,
    approve,
    reject,
  } = useAdminTopUpRequests(adminPassword);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await approve.mutateAsync(id);
      toast.success("Top-up approved!");
    } catch {
      toast.error("Failed to approve");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await reject.mutateAsync(id);
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="phone-frame flex flex-col min-h-dvh">
      <div className="gradient-header px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Admin Panel
            </h1>
            <p className="text-white/70 text-sm mt-0.5">Owner Dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAdminPassword(null);
              setScreen("auth");
            }}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="users" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 grid grid-cols-4 rounded-2xl bg-muted h-10">
            <TabsTrigger
              value="users"
              className="rounded-xl text-xs"
              data-ocid="admin.users_tab"
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="rounded-xl text-xs"
              data-ocid="admin.transactions_tab"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
              Txns
            </TabsTrigger>
            <TabsTrigger
              value="topup"
              className="rounded-xl text-xs"
              data-ocid="admin.topup_tab"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" />
              TopUp
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="rounded-xl text-xs"
              data-ocid="admin.messages_tab"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Msgs
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <TabsContent value="users" className="mt-0">
              <div className="bg-card rounded-2xl overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Username</TableHead>
                      <TableHead className="text-xs">Phone</TableHead>
                      <TableHead className="text-xs text-right">
                        Coins
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users ?? []).map((u, i) => (
                      <TableRow
                        key={u.id}
                        data-ocid={`admin.users.item.${i + 1}`}
                      >
                        <TableCell className="text-xs font-medium">
                          {u.username}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.phone}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold">
                          {u.coinBalance}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(users ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground py-8"
                        >
                          No users
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <div className="bg-card rounded-2xl overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">From→To</TableHead>
                      <TableHead className="text-xs">Purpose</TableHead>
                      <TableHead className="text-xs text-right">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...(transactions ?? [])].reverse().map((tx, i) => (
                      <TableRow
                        key={tx.id}
                        data-ocid={`admin.transactions.item.${i + 1}`}
                      >
                        <TableCell className="text-xs">
                          <span className="font-medium">{tx.fromUser}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            → {tx.toUser}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {tx.purpose}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold">
                          {tx.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(transactions ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground py-8"
                        >
                          No transactions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="topup" className="mt-0">
              <div className="space-y-3">
                {(topups ?? []).length === 0 && (
                  <div
                    className="bg-card rounded-2xl p-8 text-center text-muted-foreground text-sm"
                    data-ocid="admin.topup.empty_state"
                  >
                    No top-up requests
                  </div>
                )}
                {(topups ?? []).map((req, i) => (
                  <div
                    key={req.id}
                    className="bg-card rounded-2xl p-4 shadow-xs"
                    data-ocid={`admin.topup.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {req.userId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{req.realAmount} → {Number(req.coinsRequested)} coins
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(req.timestamp)}
                        </p>
                      </div>
                      <Badge
                        className="rounded-full"
                        style={
                          req.status === "approved"
                            ? {
                                background: "oklch(0.65 0.20 145)",
                                color: "white",
                              }
                            : req.status === "rejected"
                              ? {}
                              : {
                                  background: "oklch(0.78 0.18 75 / 0.2)",
                                  color: "oklch(0.45 0.16 75)",
                                }
                        }
                        variant={
                          req.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted rounded-xl p-2 mb-3">
                      {req.verificationNote}
                    </p>
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={approvingId === req.id}
                          className="flex-1 rounded-xl h-9 text-xs"
                          style={{
                            background: "oklch(0.65 0.20 145)",
                            color: "white",
                          }}
                          data-ocid={`admin.approve_button.${i + 1}`}
                        >
                          {approvingId === req.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(req.id)}
                          disabled={rejectingId === req.id}
                          className="flex-1 rounded-xl h-9 text-xs"
                          data-ocid={`admin.reject_button.${i + 1}`}
                        >
                          {rejectingId === req.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <div className="bg-card rounded-2xl overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">From</TableHead>
                      <TableHead className="text-xs">To</TableHead>
                      <TableHead className="text-xs">Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...(messages ?? [])].reverse().map((msg, i) => (
                      <TableRow
                        key={msg.id}
                        data-ocid={`admin.messages.item.${i + 1}`}
                      >
                        <TableCell className="text-xs font-medium">
                          {msg.fromUser}
                        </TableCell>
                        <TableCell className="text-xs">{msg.toUser}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                          {msg.note}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(messages ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground py-8"
                        >
                          No messages
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const { setScreen, adminPassword, setAdminPassword } = useApp();
  const loginMutation = useAdminLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (adminPassword) {
    return <AdminDashboard adminPassword={adminPassword} />;
  }

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Enter credentials");
      return;
    }
    try {
      const ok = await loginMutation.mutateAsync({ username, password });
      if (ok) {
        setAdminPassword(password);
        toast.success("Welcome, Admin!");
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    }
  };

  return (
    <div className="phone-frame flex flex-col min-h-dvh items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-card rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Login
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Owner access only
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-card p-6 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Username</Label>
            <Input
              placeholder="Admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl h-11"
              data-ocid="admin.username_input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Password</Label>
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="rounded-xl h-11"
              data-ocid="admin.password_input"
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={loginMutation.isPending}
            className="w-full gradient-card text-white font-semibold rounded-2xl h-12"
            data-ocid="admin.login_button"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...
              </>
            ) : (
              "Login as Admin"
            )}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setScreen("auth")}
          className="w-full text-center mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to App
        </button>
      </motion.div>
    </div>
  );
}
