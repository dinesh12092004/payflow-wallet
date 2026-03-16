import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserID = Text;
  type Profile = {
    id : UserID;
    username : Text;
    phone : Text;
    coinBalance : Float;
  };

  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Text.compare(profile1.username, profile2.username);
    };
  };

  let userProfiles = Map.empty<Principal, Profile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func registerUser(username : Text, phone : Text) : async UserID {
    if (userProfiles.values().toArray().find(func(profile) { profile.username == username }) != null) {
      Runtime.trap("Username already exists");
    };
    let id = caller.toText();
    let newUser = {
      id;
      username;
      phone;
      coinBalance = 0.0;
    };
    userProfiles.add(caller, newUser);
    id;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Transaction = {
    id : Text;
    fromUser : Text;
    toUser : Text;
    amount : Float;
    purpose : Text;
    note : Text;
    timestamp : ?Int;
  };

  type TopUpRequest = {
    id : Text;
    userId : Text;
    realAmount : Float;
    coinsRequested : Nat;
    verificationNote : Text;
    status : Text;
    timestamp : ?Int;
  };

  type Task = {
    id : Text;
    creatorId : Text;
    title : Text;
    description : Text;
    rewardCoins : Nat;
    status : Text;
    claimedBy : ?Text;
    timestamp : ?Int;
  };

  let transactions = Map.empty<Text, Transaction>();
  let topUpRequests = Map.empty<Text, TopUpRequest>();
  let messages = Map.empty<Text, Transaction>();
  let tasks = Map.empty<Text, Task>();
  var taskCounter : Nat = 0;
  var topUpCounter : Nat = 0;

  let ADMIN_USERNAME = "Dineshthe";
  let ADMIN_PASSWORD = "Dineshthe god";

  public shared ({ caller }) func sendCoins(fromUser : Text, toUserName : Text, amount : Float, purpose : Text, note : Text) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send coins");
    };

    let fromUserProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Sender not found") };
      case (?profile) {
        if (profile.id != fromUser) {
          Runtime.trap("Unauthorized: Can only send from your own account");
        };
        profile;
      };
    };

    let toUserProfile = userProfiles.values().toArray().find(
      func(profile) { profile.username == toUserName }
    );

    if (amount <= 0.0 or fromUserProfile.coinBalance < amount) {
      Runtime.trap("Insufficient coins balance");
    };

    let updatedFromUserProfile = {
      fromUserProfile with coinBalance = fromUserProfile.coinBalance - amount;
    };
    userProfiles.add(caller, updatedFromUserProfile);

    switch (toUserProfile) {
      case (null) {
        Runtime.trap("Recipient not found");
      };
      case (?originalToUser) {
        let updatedToUser = {
          originalToUser with coinBalance = originalToUser.coinBalance + amount;
        };
        let recipient = userProfiles.entries().toArray().find(
          func((_, profile)) { profile.username == toUserName }
        );
        switch (recipient) {
          case (?recipientEntry) {
            let (principal, _) = recipientEntry;
            userProfiles.add(principal, updatedToUser);
          };
          case (null) {
            Runtime.trap("Recipient principal not found");
          };
        };
      };
    };

    let transaction = {
      id = fromUser # toUserName # (fromUserProfile.coinBalance + amount).toText();
      fromUser;
      toUser = toUserName;
      amount;
      purpose;
      note;
      timestamp = null;
    };

    transactions.add(transaction.id, transaction);
    amount;
  };

  public shared ({ caller }) func submitTopUpRequest(realAmount : Float, coinsRequested : Nat, verificationNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit top-up requests");
    };

    topUpCounter += 1;
    let topUpRequest = {
      id = topUpCounter.toText();
      userId = caller.toText();
      realAmount;
      coinsRequested;
      verificationNote;
      status = "pending";
      timestamp = null;
    };

    topUpRequests.add(topUpRequest.id, topUpRequest);
  };

  public query ({ caller }) func getMyTopUpRequests() : async [TopUpRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their top-up requests");
    };

    let userId = caller.toText();
    let filteredRequests = topUpRequests.values().toArray().filter(
      func(request) { request.userId == userId }
    );
    filteredRequests;
  };

  public shared ({ caller }) func sendMessage(toUsername : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let fromUserProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Sender not found") };
      case (?profile) { profile };
    };

    let message = {
      id = fromUserProfile.id # toUsername # "messageId";
      fromUser = fromUserProfile.id;
      toUser = toUsername;
      amount = 0.0;
      purpose = "message";
      note = content;
      timestamp = null;
    };
    messages.add(message.id, message);
  };

  public query ({ caller }) func getConversation(otherUsername : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let myProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let filteredMessages = messages.values().toArray().filter(
      func(message) {
        (message.fromUser == myProfile.id and message.toUser == otherUsername) or
        (message.fromUser == otherUsername and message.toUser == myProfile.id)
      }
    );
    filteredMessages;
  };

  public query ({ caller }) func getMyTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their transactions");
    };

    let myProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let filteredTransactions = transactions.values().toArray().filter(
      func(transaction) {
        transaction.fromUser == myProfile.id or transaction.toUser == myProfile.username
      }
    );
    filteredTransactions;
  };

  public query ({ caller }) func getMyMessages() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their messages");
    };

    let myProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let filteredMessages = messages.values().toArray().filter(
      func(message) {
        message.fromUser == myProfile.id or message.toUser == myProfile.username
      }
    );
    filteredMessages;
  };

  public query ({ caller }) func getMyBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their balance");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?profile) {
        profile.coinBalance;
      };
    };
  };

  public query func getTasks() : async [Task] {
    tasks.values().toArray();
  };

  public shared ({ caller }) func createTask(title : Text, description : Text, rewardCoins : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let creatorProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (creatorProfile.coinBalance < rewardCoins.toFloat()) {
      Runtime.trap("Insufficient balance to create task");
    };

    taskCounter += 1;
    let taskId = taskCounter.toText();
    let task = {
      id = taskId;
      creatorId = creatorProfile.id;
      title;
      description;
      rewardCoins;
      status = "open";
      claimedBy = null;
      timestamp = null;
    };

    tasks.add(taskId, task);
    taskId;
  };

  public shared ({ caller }) func claimTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim tasks");
    };

    let claimerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?t) { t };
    };

    if (task.status != "open") {
      Runtime.trap("Task is not available");
    };

    if (task.creatorId == claimerProfile.id) {
      Runtime.trap("Cannot claim your own task");
    };

    let updatedTask = {
      task with status = "claimed";
      claimedBy = ?claimerProfile.id;
    };

    tasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func completeTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?t) { t };
    };

    if (task.status != "claimed") {
      Runtime.trap("Task must be claimed before completion");
    };

    let claimerId = switch (task.claimedBy) {
      case (null) { Runtime.trap("Task has no claimer") };
      case (?id) { id };
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (callerProfile.id != claimerId) {
      Runtime.trap("Unauthorized: Only the claimer can complete this task");
    };

    let creatorEntry = userProfiles.entries().toArray().find(
      func((_, profile)) { profile.id == task.creatorId }
    );

    let (creatorPrincipal, creatorProfile) = switch (creatorEntry) {
      case (null) { Runtime.trap("Task creator not found") };
      case (?entry) { entry };
    };

    if (creatorProfile.coinBalance < task.rewardCoins.toFloat()) {
      Runtime.trap("Creator has insufficient balance");
    };

    let updatedCreator = {
      creatorProfile with coinBalance = creatorProfile.coinBalance - task.rewardCoins.toFloat();
    };
    userProfiles.add(creatorPrincipal, updatedCreator);

    let updatedClaimer = {
      callerProfile with coinBalance = callerProfile.coinBalance + task.rewardCoins.toFloat();
    };
    userProfiles.add(caller, updatedClaimer);

    let updatedTask = {
      task with status = "completed";
    };
    tasks.add(taskId, updatedTask);
  };

  public shared func adminLogin(username : Text, password : Text) : async Bool {
    username == ADMIN_USERNAME and password == ADMIN_PASSWORD;
  };

  public query ({ caller }) func adminGetAllUsers(adminPassword : Text) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };
    userProfiles.values().toArray();
  };

  public query ({ caller }) func adminGetAllTransactions(adminPassword : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };
    transactions.values().toArray();
  };

  public query ({ caller }) func adminGetTopUpRequests(adminPassword : Text) : async [TopUpRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view top-up requests");
    };
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };
    topUpRequests.values().toArray();
  };

  public shared ({ caller }) func adminApproveTopUp(adminPassword : Text, requestId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve top-ups");
    };
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };

    let request = switch (topUpRequests.get(requestId)) {
      case (null) { Runtime.trap("Top-up request not found") };
      case (?req) { req };
    };

    if (request.status != "pending") {
      Runtime.trap("Request is not pending");
    };

    let userEntry = userProfiles.entries().toArray().find(
      func((principal, profile)) { profile.id == request.userId }
    );

    let (userPrincipal, userProfile) = switch (userEntry) {
      case (null) { Runtime.trap("User not found") };
      case (?entry) { entry };
    };

    let updatedUser = {
      userProfile with coinBalance = userProfile.coinBalance + request.coinsRequested.toFloat();
    };
    userProfiles.add(userPrincipal, updatedUser);

    let updatedRequest = {
      request with status = "approved";
    };
    topUpRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func adminRejectTopUp(adminPassword : Text, requestId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject top-ups");
    };
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };

    let request = switch (topUpRequests.get(requestId)) {
      case (null) { Runtime.trap("Top-up request not found") };
      case (?req) { req };
    };

    if (request.status != "pending") {
      Runtime.trap("Request is not pending");
    };

    let updatedRequest = {
      request with status = "rejected";
    };
    topUpRequests.add(requestId, updatedRequest);
  };

  public query ({ caller }) func adminGetAllMessages(adminPassword : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all messages");
    };
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };
    messages.values().toArray();
  };
};
