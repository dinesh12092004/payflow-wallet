# PayFlow Wallet

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Customer wallet app (PhonePe-style) with coin balance
- Send coins to other users by phone number / username
- Receive coins with transaction history
- Real currency → coins top-up flow (customer submits amount + verification proof, owner approves and coins are credited)
- In-app messaging between users for transaction communication
- Customer registration and login (username + phone number)
- Admin/Owner panel accessible only via hardcoded credentials (username: "Dineshthe", password: "Dineshthe god")
  - View all users, balances, transactions
  - Approve/reject top-up (currency → coins) requests
  - View all messages
- Task board: customers can post and complete tasks with coin rewards
- Transaction purposes: Payment, Transfer, Task Reward, Top-Up

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: User accounts (username, phone, coin balance), transactions, top-up requests, messages, tasks
2. Backend: Owner-only admin functions protected by hardcoded credentials check
3. Frontend: Customer auth (register/login), home dashboard with balance
4. Frontend: Send coins form, transaction history
5. Frontend: Top-up request form (enter amount, submit for verification)
6. Frontend: Messaging screen between users
7. Frontend: Task board (post task with reward, claim task)
8. Frontend: Admin panel (view all data, approve top-ups)
