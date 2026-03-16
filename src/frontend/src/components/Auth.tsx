import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Loader2, Shield, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegisterUser } from "../hooks/useQueries";

export default function Auth() {
  const { login, loginStatus, isInitializing, identity } =
    useInternetIdentity();
  const { setUser, setScreen } = useApp();
  const { actor } = useActor();
  const registerMutation = useRegisterUser();

  const [mode, setMode] = useState<"connect" | "register">("connect");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [checkingProfile, setCheckingProfile] = useState(false);

  const isLoggedIn = identity !== null;

  const handleConnect = async () => {
    await login();
  };

  const handleCheckProfile = async () => {
    if (!actor) return;
    setCheckingProfile(true);
    try {
      const profile = await actor.getCallerUserProfile();
      if (profile) {
        setUser(profile);
        setScreen("home");
      } else {
        setMode("register");
      }
    } catch {
      toast.error("Failed to check profile");
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !phone.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await registerMutation.mutateAsync({
        username: username.trim(),
        phone: phone.trim(),
      });
      if (!actor) return;
      const profile = await actor.getCallerUserProfile();
      if (profile) {
        setUser(profile);
        setScreen("home");
        toast.success("Welcome to CoinPay! 🎉");
      }
    } catch {
      toast.error("Registration failed. Username might be taken.");
    }
  };

  return (
    <div className="phone-frame flex flex-col min-h-dvh">
      {/* Header */}
      <div className="gradient-header px-6 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute rounded-full border border-white"
            style={{
              width: "80px",
              height: "80px",
              top: "-20px",
              right: "-20px",
            }}
          />
          <div
            className="absolute rounded-full border border-white"
            style={{
              width: "120px",
              height: "120px",
              top: "-10px",
              right: "-15px",
            }}
          />
          <div
            className="absolute rounded-full border border-white"
            style={{
              width: "160px",
              height: "160px",
              top: "0px",
              right: "-10px",
            }}
          />
          <div
            className="absolute rounded-full border border-white"
            style={{
              width: "200px",
              height: "200px",
              top: "10px",
              right: "-5px",
            }}
          />
          <div
            className="absolute rounded-full border border-white"
            style={{
              width: "240px",
              height: "240px",
              top: "20px",
              right: "0px",
            }}
          />
          <div
            className="absolute rounded-full border border-white"
            style={{
              width: "280px",
              height: "280px",
              top: "30px",
              right: "5px",
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                CoinPay
              </h1>
              <p className="text-white/70 text-sm">Digital Wallet</p>
            </div>
          </div>
          <p className="text-white/90 text-base leading-relaxed">
            Send coins, complete tasks, and manage your digital money — all in
            one place.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-3xl shadow-card p-6"
        >
          {!isLoggedIn || isInitializing ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 gradient-card rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Get Started
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Connect securely with Internet Identity
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={loginStatus === "logging-in" || isInitializing}
                className="w-full gradient-card text-white font-semibold py-3 rounded-2xl h-12"
                data-ocid="auth.login_button"
              >
                {loginStatus === "logging-in" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" /> Connect with
                    Internet Identity
                  </>
                )}
              </Button>
            </>
          ) : mode === "connect" ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield
                    className="w-8 h-8 text-success"
                    style={{ color: "oklch(0.55 0.18 145)" }}
                  />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Connected!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Identity verified. Let's find your account.
                </p>
              </div>
              <Button
                onClick={handleCheckProfile}
                disabled={checkingProfile}
                className="w-full gradient-card text-white font-semibold py-3 rounded-2xl h-12"
                data-ocid="auth.login_button"
              >
                {checkingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Checking...
                  </>
                ) : (
                  "Continue to Account"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-display font-bold text-foreground">
                  Create Account
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Set up your CoinPay profile
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    Username
                  </Label>
                  <Input
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-xl h-11"
                    data-ocid="auth.username_input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    Phone Number
                  </Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-11"
                    data-ocid="auth.phone_input"
                  />
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                  className="w-full gradient-card text-white font-semibold py-3 rounded-2xl h-12 mt-2"
                  data-ocid="auth.register_button"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { icon: "💸", label: "Send Coins" },
            { icon: "💬", label: "Messaging" },
            { icon: "🎯", label: "Earn Tasks" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-card rounded-2xl p-3 text-center shadow-xs"
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs font-medium text-muted-foreground">
                {f.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Admin link */}
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setScreen("admin-login")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Panel →
          </button>
        </div>
      </div>
    </div>
  );
}
