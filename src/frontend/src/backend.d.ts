import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TopUpRequest {
    id: string;
    status: string;
    realAmount: number;
    verificationNote: string;
    userId: string;
    timestamp?: bigint;
    coinsRequested: bigint;
}
export interface Task {
    id: string;
    status: string;
    title: string;
    creatorId: string;
    rewardCoins: bigint;
    description: string;
    claimedBy?: string;
    timestamp?: bigint;
}
export interface Profile {
    id: UserID;
    username: string;
    coinBalance: number;
    phone: string;
}
export type UserID = string;
export interface Transaction {
    id: string;
    note: string;
    toUser: string;
    timestamp?: bigint;
    fromUser: string;
    amount: number;
    purpose: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminApproveTopUp(adminPassword: string, requestId: string): Promise<void>;
    adminGetAllMessages(adminPassword: string): Promise<Array<Transaction>>;
    adminGetAllTransactions(adminPassword: string): Promise<Array<Transaction>>;
    adminGetAllUsers(adminPassword: string): Promise<Array<Profile>>;
    adminGetTopUpRequests(adminPassword: string): Promise<Array<TopUpRequest>>;
    adminLogin(username: string, password: string): Promise<boolean>;
    adminRejectTopUp(adminPassword: string, requestId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimTask(taskId: string): Promise<void>;
    completeTask(taskId: string): Promise<void>;
    createTask(title: string, description: string, rewardCoins: bigint): Promise<string>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(otherUsername: string): Promise<Array<Transaction>>;
    getMyBalance(): Promise<number>;
    getMyMessages(): Promise<Array<Transaction>>;
    getMyTopUpRequests(): Promise<Array<TopUpRequest>>;
    getMyTransactions(): Promise<Array<Transaction>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(username: string, phone: string): Promise<UserID>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    sendCoins(fromUser: string, toUserName: string, amount: number, purpose: string, note: string): Promise<number>;
    sendMessage(toUsername: string, content: string): Promise<void>;
    submitTopUpRequest(realAmount: number, coinsRequested: bigint, verificationNote: string): Promise<void>;
}
