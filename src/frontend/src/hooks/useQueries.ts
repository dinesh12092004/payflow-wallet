import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBalance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getMyBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopUpRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topup-requests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTopUpRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMessages() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useConversation(otherUsername: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["conversation", otherUsername],
    queryFn: async () => {
      if (!actor || !otherUsername) return [];
      return actor.getConversation(otherUsername);
    },
    enabled: !!actor && !isFetching && !!otherUsername,
  });
}

export function useTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      phone,
    }: { username: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerUser(username, phone);
    },
  });
}

export function useSendCoins() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromUser,
      toUserName,
      amount,
      purpose,
      note,
    }: {
      fromUser: string;
      toUserName: string;
      amount: number;
      purpose: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendCoins(fromUser, toUserName, amount, purpose, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useSubmitTopUp() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      realAmount,
      coinsRequested,
      verificationNote,
    }: {
      realAmount: number;
      coinsRequested: bigint;
      verificationNote: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitTopUpRequest(
        realAmount,
        coinsRequested,
        verificationNote,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topup-requests"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      toUsername,
      content,
    }: { toUsername: string; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(toUsername, content);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({
        queryKey: ["conversation", variables.toUsername],
      });
    },
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      rewardCoins,
    }: {
      title: string;
      description: string;
      rewardCoins: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(title, description, rewardCoins);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useClaimTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.claimTask(taskId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeTask(taskId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

// Admin hooks
export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminLogin(username, password);
    },
  });
}

export function useAdminUsers(adminPassword: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-users", adminPassword],
    queryFn: async () => {
      if (!actor || !adminPassword) return [];
      return actor.adminGetAllUsers(adminPassword);
    },
    enabled: !!actor && !isFetching && !!adminPassword,
  });
}

export function useAdminTransactions(adminPassword: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-transactions", adminPassword],
    queryFn: async () => {
      if (!actor || !adminPassword) return [];
      return actor.adminGetAllTransactions(adminPassword);
    },
    enabled: !!actor && !isFetching && !!adminPassword,
  });
}

export function useAdminTopUpRequests(adminPassword: string | null) {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-topup", adminPassword],
    queryFn: async () => {
      if (!actor || !adminPassword) return [];
      return actor.adminGetTopUpRequests(adminPassword);
    },
    enabled: !!actor && !isFetching && !!adminPassword,
  });

  const approve = useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor || !adminPassword) throw new Error("Not connected");
      return actor.adminApproveTopUp(adminPassword, requestId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-topup"] }),
  });

  const reject = useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor || !adminPassword) throw new Error("Not connected");
      return actor.adminRejectTopUp(adminPassword, requestId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-topup"] }),
  });

  return { ...query, approve, reject };
}

export function useAdminMessages(adminPassword: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-messages", adminPassword],
    queryFn: async () => {
      if (!actor || !adminPassword) return [];
      return actor.adminGetAllMessages(adminPassword);
    },
    enabled: !!actor && !isFetching && !!adminPassword,
  });
}
