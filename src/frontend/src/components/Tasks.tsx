import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  Coins,
  Loader2,
  Plus,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend";
import { useApp } from "../context/AppContext";
import {
  useClaimTask,
  useCompleteTask,
  useCreateTask,
  useTasks,
} from "../hooks/useQueries";

function TaskCard({
  task,
  index,
  onClaim,
  onComplete,
  currentUser,
  isClaiming,
  isCompleting,
}: {
  task: Task;
  index: number;
  onClaim: (id: string) => void;
  onComplete: (id: string) => void;
  currentUser: string;
  isClaiming: boolean;
  isCompleting: boolean;
}) {
  const isOpen = task.status === "open";
  const isClaimed = task.status === "claimed";
  const isDone = task.status === "completed";
  const myTask = task.claimedBy === currentUser;

  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-xs"
      data-ocid={`tasks.item.${index}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {task.description}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <Coins className="w-4 h-4 coin-gold" />
          <span className="font-bold text-sm text-foreground">
            {Number(task.rewardCoins)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        {isDone ? (
          <Badge
            style={{ background: "oklch(0.65 0.20 145)", color: "white" }}
            className="rounded-full"
          >
            <Trophy className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        ) : isClaimed ? (
          <Badge
            style={{
              background: "oklch(0.78 0.18 75 / 0.2)",
              color: "oklch(0.45 0.16 75)",
            }}
            className="rounded-full"
          >
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">
            Open
          </Badge>
        )}
        {isOpen && (
          <Button
            size="sm"
            onClick={() => onClaim(task.id)}
            disabled={isClaiming}
            className="gradient-card text-white rounded-xl h-8 text-xs"
            data-ocid={`tasks.claim_button.${index}`}
          >
            {isClaiming ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Claim"
            )}
          </Button>
        )}
        {isClaimed && myTask && (
          <Button
            size="sm"
            onClick={() => onComplete(task.id)}
            disabled={isCompleting}
            className="rounded-xl h-8 text-xs"
            style={{ background: "oklch(0.65 0.20 145)", color: "white" }}
          >
            {isCompleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Complete"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user, setScreen } = useApp();
  const { data: tasks, isLoading } = useTasks();
  const claimMutation = useClaimTask();
  const completeMutation = useCompleteTask();
  const createMutation = useCreateTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newReward, setNewReward] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      await claimMutation.mutateAsync(id);
      toast.success("Task claimed!");
    } catch {
      toast.error("Failed to claim task");
    } finally {
      setClaimingId(null);
    }
  };

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await completeMutation.mutateAsync(id);
      toast.success("Task completed! Coins earned 🎉");
    } catch {
      toast.error("Failed to complete task");
    } finally {
      setCompletingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !newReward) {
      toast.error("Fill all fields");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: newTitle.trim(),
        description: newDesc.trim(),
        rewardCoins: BigInt(Number(newReward)),
      });
      toast.success("Task created!");
      setDialogOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewReward("");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const openTasks = (tasks ?? []).filter((t) => t.status === "open");
  const activeTasks = (tasks ?? []).filter((t) => t.status === "claimed");
  const doneTasks = (tasks ?? []).filter((t) => t.status === "completed");

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Tasks
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              Complete tasks, earn coins
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-white/20 text-white rounded-2xl h-10 hover:bg-white/30"
                data-ocid="tasks.create_button"
              >
                <Plus className="w-4 h-4 mr-1" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm rounded-3xl mx-4">
              <DialogHeader>
                <DialogTitle className="font-display">Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Title *
                  </Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Task title"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Description *
                  </Label>
                  <Textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe the task..."
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Reward Coins *
                  </Label>
                  <Input
                    type="number"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="e.g. 50"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full gradient-card text-white rounded-2xl h-11"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (
          <>
            {openTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Available ({openTasks.length})
                </h2>
                <div className="space-y-3">
                  {openTasks.map((t, i) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      index={i + 1}
                      onClaim={handleClaim}
                      onComplete={handleComplete}
                      currentUser={user?.username ?? ""}
                      isClaiming={claimingId === t.id}
                      isCompleting={completingId === t.id}
                    />
                  ))}
                </div>
              </div>
            )}
            {activeTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  In Progress ({activeTasks.length})
                </h2>
                <div className="space-y-3">
                  {activeTasks.map((t, i) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      index={i + 1}
                      onClaim={handleClaim}
                      onComplete={handleComplete}
                      currentUser={user?.username ?? ""}
                      isClaiming={claimingId === t.id}
                      isCompleting={completingId === t.id}
                    />
                  ))}
                </div>
              </div>
            )}
            {doneTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Completed ({doneTasks.length})
                </h2>
                <div className="space-y-3">
                  {doneTasks.map((t, i) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      index={i + 1}
                      onClaim={handleClaim}
                      onComplete={handleComplete}
                      currentUser={user?.username ?? ""}
                      isClaiming={claimingId === t.id}
                      isCompleting={completingId === t.id}
                    />
                  ))}
                </div>
              </div>
            )}
            {(tasks ?? []).length === 0 && (
              <div
                className="bg-card rounded-2xl p-10 text-center"
                data-ocid="tasks.empty_state"
              >
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a task and let others complete it
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
