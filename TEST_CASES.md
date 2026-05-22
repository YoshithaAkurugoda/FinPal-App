# FinPal — Comprehensive Test Cases

**Project:** FinPal - Intelligent Personal Finance Companion  
**Test Scope:** Frontend (Mobile) & Backend (API) & Database  
**Date Created:** 2026-05-21  
**Test Approach:** Black Box & White Box Testing

---

## Table of Contents

1. [Test Scope Overview](#test-scope-overview)
2. [Black Box Testing - User Flows](#black-box-testing---user-flows)
3. [White Box Testing - API & Service Layer](#white-box-testing---api--service-layer)
4. [Database Testing](#database-testing)
5. [Worker & Asynchronous Operations Testing](#worker--asynchronous-operations-testing)

---

## Test Scope Overview

### Testing Layers

| Layer | Component | Testing Type |
|-------|-----------|--------------|
| **Frontend** | React Native Mobile App (Expo) | Black Box & White Box |
| **Backend** | Express API (REST endpoints) | White Box |
| **Database** | PostgreSQL (Prisma ORM) | White Box |
| **Workers** | BullMQ Background Jobs (SMS/PDF parsing, notifications) | White Box |
| **External Services** | Anthropic Claude API, Firebase FCM | Integration (Mocked/Stubbed) |

### Testing Environments

- **Local Development:** Docker Compose (Postgres + Redis), Node 20+, Expo Go
- **Mobile:** iOS Simulator / Android Emulator / Physical Device
- **API:** Port 3000 (dev server)
- **Workers:** Separate process (required for SMS/PDF ingestion)

---

# BLACK BOX TESTING — USER FLOWS

## Section 1: Authentication & Onboarding

### Test Case 1.1: User Registration with Valid Data

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-001 |
| **Description** | User can successfully register with valid email and password |
| **Preconditions** | App is launched; user is on register screen |
| **Test Steps** | 1. Enter email: `test.user@example.com` <br> 2. Enter password: `SecurePass123!` <br> 3. Enter name: `Test User` <br> 4. Tap "Register" |
| **Expected Output** | ✓ User account created in database <br> ✓ JWT tokens received (access + refresh) <br> ✓ Redirect to onboarding screen <br> ✓ Success toast/alert displayed |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach register screen & onboarding screen]* |

### Test Case 1.2: User Registration with Duplicate Email

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-002 |
| **Description** | System rejects registration with existing email address |
| **Preconditions** | Email `existing@example.com` already exists in database |
| **Test Steps** | 1. Enter email: `existing@example.com` <br> 2. Enter password: `SecurePass123!` <br> 3. Enter name: `Another User` <br> 4. Tap "Register" |
| **Expected Output** | ✗ Error message: "Email already registered" <br> ✗ User remains on register screen <br> ✗ No account created |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error message screen]* |

### Test Case 1.3: User Registration with Invalid Email Format

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-003 |
| **Description** | System rejects registration with invalid email format |
| **Preconditions** | App is on register screen |
| **Test Steps** | 1. Enter email: `notanemail` <br> 2. Enter password: `SecurePass123!` <br> 3. Enter name: `Test User` <br> 4. Tap "Register" |
| **Expected Output** | ✗ Validation error: "Invalid email format" <br> ✗ "Register" button disabled or error shown <br> ✗ No API call made |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach validation error screen]* |

### Test Case 1.4: User Registration with Weak Password

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-004 |
| **Description** | System enforces password complexity requirements |
| **Preconditions** | App is on register screen |
| **Test Steps** | 1. Enter email: `user@example.com` <br> 2. Enter password: `123` <br> 3. Enter name: `Test User` <br> 4. Attempt to submit |
| **Expected Output** | ✗ Validation error: "Password must be at least 8 characters" <br> ✗ Submit button disabled <br> ✗ No API call made |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach password validation screen]* |

### Test Case 1.5: User Login with Valid Credentials

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-005 |
| **Description** | User successfully logs in with valid email and password |
| **Preconditions** | User account exists; user is on login screen |
| **Test Steps** | 1. Enter email: `test.user@example.com` <br> 2. Enter password: `SecurePass123!` <br> 3. Tap "Login" |
| **Expected Output** | ✓ JWT tokens received (access + refresh) <br> ✓ Redirect to home/dashboard screen <br> ✓ Wallets and transactions loaded <br> ✓ User profile accessible |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach login success & home screen]* |

### Test Case 1.6: User Login with Invalid Password

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-006 |
| **Description** | System denies login with incorrect password |
| **Preconditions** | User account exists; user is on login screen |
| **Test Steps** | 1. Enter email: `test.user@example.com` <br> 2. Enter password: `WrongPassword123!` <br> 3. Tap "Login" |
| **Expected Output** | ✗ Error message: "Invalid email or password" <br> ✗ User remains on login screen <br> ✗ No tokens generated |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach login error screen]* |

### Test Case 1.7: User Login with Non-existent Email

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-007 |
| **Description** | System rejects login for unregistered email address |
| **Preconditions** | Email does not exist in database |
| **Test Steps** | 1. Enter email: `nonexistent@example.com` <br> 2. Enter password: `SecurePass123!` <br> 3. Tap "Login" |
| **Expected Output** | ✗ Error message: "Invalid email or password" <br> ✗ User remains on login screen |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error screen]* |

### Test Case 1.8: User Completes Onboarding

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-008 |
| **Description** | New user completes onboarding and sets up profile |
| **Preconditions** | User just registered; on onboarding screen |
| **Test Steps** | 1. Enter name: `John Doe` <br> 2. Select currency: `LKR` <br> 3. Enter monthly income: `50000` <br> 4. Tap "Complete Setup" |
| **Expected Output** | ✓ User profile updated in database <br> ✓ Redirect to home screen <br> ✓ Default wallet may be created <br> ✓ Dashboard shows user data |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach onboarding flow & home screen]* |

### Test Case 1.9: Token Refresh Flow

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-009 |
| **Description** | App automatically refreshes expired access token using refresh token |
| **Preconditions** | User is logged in; access token has expired (or simulated to expire) |
| **Test Steps** | 1. Wait for access token to expire <br> 2. Make any API request (e.g., fetch wallets) <br> 3. App should automatically refresh token |
| **Expected Output** | ✓ Refresh token used to get new access token <br> ✓ Original request retried successfully <br> ✓ No user login required <br> ✓ User session seamless |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach network logs showing token refresh]* |

### Test Case 1.10: Logout Functionality

| Field | Value |
|-------|-------|
| **Test ID** | BT-AUTH-010 |
| **Description** | User can successfully logout and return to login screen |
| **Preconditions** | User is logged in; on home screen |
| **Test Steps** | 1. Tap settings icon <br> 2. Scroll to "Logout" button <br> 3. Tap "Logout" <br> 4. Confirm logout |
| **Expected Output** | ✓ Tokens cleared from device storage <br> ✓ User redirected to login screen <br> ✓ Previous session data not accessible <br> ✓ No cached sensitive data visible |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach settings & login screen after logout]* |

---

## Section 2: Wallet Management

### Test Case 2.1: Create New Wallet

| Field | Value |
|-------|-------|
| **Test ID** | BT-WAL-001 |
| **Description** | User can create a new wallet with initial balance |
| **Preconditions** | User is logged in; on wallets screen |
| **Test Steps** | 1. Tap "+ Add Wallet" <br> 2. Enter name: `Main Bank Account` <br> 3. Select type: `bank` <br> 4. Enter starting balance: `100000` <br> 5. Tap "Create Wallet" |
| **Expected Output** | ✓ Wallet created in database <br> ✓ Wallet appears in list <br> ✓ Starting balance displayed correctly <br> ✓ Current balance equals starting balance <br> ✓ Success notification shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach wallet creation form & wallet list]* |

### Test Case 2.2: Create Wallet with Invalid Starting Balance

| Field | Value |
|-------|-------|
| **Test ID** | BT-WAL-002 |
| **Description** | System rejects wallet creation with negative starting balance |
| **Preconditions** | User is on wallet creation form |
| **Test Steps** | 1. Enter name: `Test Wallet` <br> 2. Select type: `cash` <br> 3. Enter starting balance: `-5000` <br> 4. Tap "Create Wallet" |
| **Expected Output** | ✗ Validation error or warning <br> ✗ Wallet not created <br> ✗ Error message displayed |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error screen]* |

### Test Case 2.3: View Wallet Details

| Field | Value |
|-------|-------|
| **Test ID** | BT-WAL-003 |
| **Description** | User can view detailed information for a wallet |
| **Preconditions** | User has at least one wallet; on wallets list |
| **Test Steps** | 1. Tap on wallet `Main Bank Account` <br> 2. View wallet details screen |
| **Expected Output** | ✓ Wallet name displayed <br> ✓ Current balance shown <br> ✓ Starting balance shown <br> ✓ Wallet type shown <br> ✓ Recent transactions listed <br> ✓ Wallet creation date shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach wallet details screen]* |

### Test Case 2.4: Delete Wallet

| Field | Value |
|-------|-------|
| **Test ID** | BT-WAL-004 |
| **Description** | User can delete a wallet |
| **Preconditions** | User has multiple wallets; viewing wallet details |
| **Test Steps** | 1. Tap menu icon (three dots) <br> 2. Tap "Delete Wallet" <br> 3. Confirm deletion |
| **Expected Output** | ✓ Confirmation dialog shown <br> ✓ Wallet deleted from database <br> ✓ Wallet removed from list <br> ✓ Associated transactions (with cascade setting) handled correctly |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach deletion confirmation & wallet list after deletion]* |

### Test Case 2.5: View Wallet Balance (Derived Calculation)

| Field | Value |
|-------|-------|
| **Test ID** | BT-WAL-005 |
| **Description** | Wallet balance correctly calculated as starting_balance + approved transactions |
| **Preconditions** | Wallet has starting balance of 100000; has 5 approved transactions totaling 25000 debit |
| **Test Steps** | 1. Open wallet details <br> 2. Check displayed balance |
| **Expected Output** | ✓ Balance displayed = 100000 - 25000 = 75000 <br> ✓ Balance is read-only (not editable) <br> ✓ Balance updates when transactions approved/rejected |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach wallet balance display]* |

### Test Case 2.6: Multiple Wallets Dashboard

| Field | Value |
|-------|-------|
| **Test ID** | BT-WAL-006 |
| **Description** | User can view all wallets and total balance across all wallets |
| **Preconditions** | User has 3 wallets with balances: 75000, 50000, 30000 |
| **Test Steps** | 1. Go to wallets screen <br> 2. View wallet list |
| **Expected Output** | ✓ All 3 wallets listed <br> ✓ Individual balances correct <br> ✓ Total balance shown: 155000 <br> ✓ Wallets sortable by balance/date |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach wallets list screen]* |

---

## Section 3: Transaction Management

### Test Case 3.1: Add Manual Transaction (Debit)

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-001 |
| **Description** | User can manually add a debit transaction |
| **Preconditions** | User is logged in; has at least one wallet; on add transaction screen |
| **Test Steps** | 1. Tap "+ Add Transaction" <br> 2. Select wallet: `Main Bank Account` <br> 3. Select type: `Debit` <br> 4. Enter amount: `5000` <br> 5. Select category: `Food` <br> 6. Enter merchant: `Pizza Hut` <br> 7. Enter date (optional) <br> 8. Tap "Add Transaction" |
| **Expected Output** | ✓ Transaction created with `status: approved` <br> ✓ Wallet balance decreases by 5000 <br> ✓ Transaction appears in list <br> ✓ Success notification shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach transaction form & updated transaction list]* |

### Test Case 3.2: Add Manual Transaction (Credit)

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-002 |
| **Description** | User can manually add a credit transaction |
| **Preconditions** | User is on add transaction screen |
| **Test Steps** | 1. Tap "+ Add Transaction" <br> 2. Select wallet: `Main Bank Account` <br> 3. Select type: `Credit` <br> 4. Enter amount: `15000` <br> 5. Select category: `Salary` <br> 6. Enter date <br> 7. Tap "Add Transaction" |
| **Expected Output** | ✓ Transaction created with `status: approved` <br> ✓ Wallet balance increases by 15000 <br> ✓ signedAmount stored as positive <br> ✓ Transaction visible in list |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach transaction creation & updated balance]* |

### Test Case 3.3: Add Transaction with Missing Fields

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-003 |
| **Description** | System validates required fields when adding transaction |
| **Preconditions** | User is on add transaction form |
| **Test Steps** | 1. Leave amount field empty <br> 2. Select category <br> 3. Attempt to submit |
| **Expected Output** | ✗ Validation error: "Amount is required" <br> ✗ Submit button disabled <br> ✗ No transaction created |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach validation error]* |

### Test Case 3.4: View Transaction Details

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-004 |
| **Description** | User can view detailed information for a transaction |
| **Preconditions** | User has transactions; on transactions list |
| **Test Steps** | 1. Tap on a transaction <br> 2. View transaction details |
| **Expected Output** | ✓ Amount displayed <br> ✓ Category shown <br> ✓ Merchant shown (if available) <br> ✓ Date shown <br> ✓ Status shown (approved/pending) <br> ✓ Wallet name shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach transaction details screen]* |

### Test Case 3.5: Edit Transaction

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-005 |
| **Description** | User can edit a pending transaction |
| **Preconditions** | User has a pending transaction (from SMS/PDF parse) |
| **Test Steps** | 1. Open transaction details <br> 2. Tap "Edit" <br> 3. Modify amount: `6000` <br> 4. Modify category: `Groceries` <br> 5. Tap "Save" |
| **Expected Output** | ✓ Transaction updated in database <br> ✓ Changes reflected in transaction list <br> ✓ History/audit trail recorded (optional) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach edit form & updated transaction]* |

### Test Case 3.6: Delete Transaction

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-006 |
| **Description** | User can delete a transaction |
| **Preconditions** | User has a transaction; viewing transaction details |
| **Test Steps** | 1. Tap menu icon <br> 2. Tap "Delete" <br> 3. Confirm deletion |
| **Expected Output** | ✓ Confirmation dialog shown <br> ✓ Transaction deleted from database <br> ✓ Wallet balance recalculated <br> ✓ Transaction removed from list |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach deletion confirmation & updated list]* |

### Test Case 3.7: Approve Pending Transaction

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-007 |
| **Description** | User approves an AI-parsed pending transaction |
| **Preconditions** | User has pending transactions from SMS/PDF parse; on pending transactions screen |
| **Test Steps** | 1. Open pending transactions list <br> 2. Review transaction details (amount, category, merchant) <br> 3. Tap "Approve" |
| **Expected Output** | ✓ Transaction status changed to `approved` <br> ✓ Wallet balance updated immediately <br> ✓ Transaction moves to approved list <br> ✓ Push notification sent (if enabled) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach pending transactions & approved state]* |

### Test Case 3.8: Reject Pending Transaction

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-008 |
| **Description** | User rejects an AI-parsed pending transaction |
| **Preconditions** | User has pending transactions |
| **Test Steps** | 1. Open pending transactions <br> 2. Tap "Reject" on a transaction <br> 3. Optionally enter reason |
| **Expected Output** | ✓ Transaction status changed to `rejected` <br> ✓ Wallet balance unaffected <br> ✓ Transaction removed from pending list <br> ✓ Optionally stored for audit purposes |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach reject action & updated pending list]* |

### Test Case 3.9: Transaction Filtering by Category

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-009 |
| **Description** | User can filter transactions by category |
| **Preconditions** | User has transactions across multiple categories (Food, Transport, Groceries) |
| **Test Steps** | 1. Open transactions screen <br> 2. Tap filter button <br> 3. Select category: `Food` <br> 4. Apply filter |
| **Expected Output** | ✓ Only Food category transactions shown <br> ✓ Count updated (e.g., "5 of 20") <br> ✓ Can clear filter to see all |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach filtered transaction list]* |

### Test Case 3.10: Transaction Filtering by Date Range

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-010 |
| **Description** | User can filter transactions by date range |
| **Preconditions** | User has transactions from multiple dates |
| **Test Steps** | 1. Open transactions screen <br> 2. Tap filter button <br> 3. Select start date: `2026-05-01` <br> 4. Select end date: `2026-05-15` <br> 5. Apply filter |
| **Expected Output** | ✓ Only transactions within date range shown <br> ✓ Transactions before/after dates excluded <br> ✓ Filter removable |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach date-filtered transaction list]* |

### Test Case 3.11: Transaction Sorting

| Field | Value |
|-------|-------|
| **Test ID** | BT-TRX-011 |
| **Description** | User can sort transactions by date, amount, or category |
| **Preconditions** | User has multiple transactions |
| **Test Steps** | 1. Open transactions screen <br> 2. Tap sort button <br> 3. Select "Date (Newest First)" |
| **Expected Output** | ✓ Transactions sorted by date in descending order <br> ✓ Most recent transaction at top <br> ✓ Can switch to other sort options (Amount, Category) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach sorted transaction list]* |

---

## Section 4: SMS & PDF Ingestion

### Test Case 4.1: Paste SMS and Create Transactions

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-001 |
| **Description** | User pastes bank SMS text; Claude AI extracts transactions |
| **Preconditions** | User is on SMS ingestion screen; workers running |
| **Test Steps** | 1. Tap "Paste SMS" <br> 2. Paste bank SMS text: <br> `"You spent LKR 5000.00 at Colombo Super. Ref: TXN123. Available Balance: 95000.00"` <br> 3. Select wallet: `Main Bank Account` <br> 4. Tap "Parse SMS" |
| **Expected Output** | ✓ Job queued to `sms-parse` worker <br> ✓ Loading/pending state shown <br> ✓ Claude extracts: amount=5000, category=Groceries, merchant=Colombo Super <br> ✓ Transaction created with `status: pending` <br> ✓ Push notification sent when complete <br> ✓ Pending transaction appears in list |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach SMS input, parsing state, & pending transaction]* |

### Test Case 4.2: Multiple Transactions from Single SMS

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-002 |
| **Description** | Claude can extract multiple transactions from a single SMS text |
| **Preconditions** | User is on SMS ingestion screen; workers running |
| **Test Steps** | 1. Paste multi-line bank SMS: <br> `"Txn 1: Spent 2000 at Restaurant. Txn 2: Spent 5000 at Shopping Mall."` <br> 2. Select wallet <br> 3. Tap "Parse SMS" |
| **Expected Output** | ✓ Worker processes and extracts 2 transactions <br> ✓ Both transactions created with `status: pending` <br> ✓ Both appear in pending list <br> ✓ Push notification sent once |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach multi-transaction extraction]* |

### Test Case 4.3: Upload PDF Statement

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-003 |
| **Description** | User uploads bank statement PDF; Claude extracts transactions |
| **Preconditions** | User is on statement upload screen; workers running |
| **Test Steps** | 1. Tap "Upload Statement" <br> 2. Select PDF file from device <br> 3. Select wallet <br> 4. Tap "Upload" |
| **Expected Output** | ✓ File uploaded to storage (Supabase) <br> ✓ Job queued to `statement-parse` worker <br> ✓ Loading state shown <br> ✓ PDF text extracted via pdf-parse library <br> ✓ Claude extracts multiple transactions <br> ✓ Transactions created with `status: pending` <br> ✓ Push notification sent <br> ✓ Pending transactions appear in list |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach file picker, upload progress, & extracted transactions]* |

### Test Case 4.4: PDF Upload without Workers Running

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-004 |
| **Description** | PDF upload shows queued status when workers are not running |
| **Preconditions** | Workers are stopped; user uploads PDF |
| **Test Steps** | 1. Stop workers <br> 2. Upload PDF statement <br> 3. Check status |
| **Expected Output** | ✗ Upload accepted but stuck in `queued` status <br> ✗ No transactions created until workers restart <br> ✓ Informational message: "Workers offline; processing pending" <br> ✓ Transactions created when workers restart |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach queued status, then processed after workers restart]* |

### Test Case 4.5: SMS Parsing with Low Confidence

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-005 |
| **Description** | System marks transactions with low AI confidence for review |
| **Preconditions** | User pastes ambiguous SMS text |
| **Test Steps** | 1. Paste unclear SMS: `"Movement of 500. Need more details."` <br> 2. Parse SMS |
| **Expected Output** | ✓ Transaction extracted with `aiConfidence: 0.45` <br> ✓ Marked as pending for user review <br> ✓ Confidence score visible in transaction details <br> ✓ Category/merchant may be uncertain or default |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach low-confidence transaction details]* |

### Test Case 4.6: Invalid File Upload (Non-PDF)

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-006 |
| **Description** | System rejects non-PDF file uploads |
| **Preconditions** | User is on statement upload screen |
| **Test Steps** | 1. Attempt to upload `.txt` or `.jpg` file <br> 2. Observe validation |
| **Expected Output** | ✗ Error message: "Only PDF files are accepted" <br> ✗ File rejected <br> ✗ No upload attempted |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach file type validation error]* |

### Test Case 4.7: Ingestion Log and History

| Field | Value |
|-------|-------|
| **Test ID** | BT-ING-007 |
| **Description** | User can view history of all SMS/PDF ingestions |
| **Preconditions** | User has completed multiple SMS/PDF uploads |
| **Test Steps** | 1. Open settings or reports <br> 2. Tap "Ingestion History" or similar |
| **Expected Output** | ✓ List shows all ingestion attempts <br> ✓ Status shown: `queued`, `processing`, `completed`, `failed` <br> ✓ Timestamp and file/text summary shown <br> ✓ Error messages visible for failed jobs |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach ingestion history view]* |

---

## Section 5: Budget Management

### Test Case 5.1: Create Monthly Budget

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-001 |
| **Description** | User can create a monthly budget for a category |
| **Preconditions** | User is on budgets screen |
| **Test Steps** | 1. Tap "+ Create Budget" <br> 2. Select category: `Food` <br> 3. Enter limit: `10000` <br> 4. Select period: `Monthly` <br> 5. Tap "Create" |
| **Expected Output** | ✓ Budget created in database <br> ✓ Budget appears in list <br> ✓ Current spending shown (0 at start) <br> ✓ Progress bar visible |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget creation form & budget list]* |

### Test Case 5.2: Budget Progress Tracking

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-002 |
| **Description** | Budget spending updates in real-time as transactions are approved |
| **Preconditions** | Budget: Food 10000/month; user adds Food transactions |
| **Test Steps** | 1. Open budgets screen <br> 2. Add approved Food transaction: 3000 <br> 3. Add another Food transaction: 4000 <br> 4. Check budget progress |
| **Expected Output** | ✓ Budget shows: 7000 / 10000 (70%) <br> ✓ Progress bar shows 70% filled <br> ✓ Balance remaining: 3000 <br> ✓ Updates immediately upon approval |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget progress at different stages]* |

### Test Case 5.3: Budget Alert at 80% Threshold

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-003 |
| **Description** | System sends notification when budget reaches 80% |
| **Preconditions** | Budget: Food 10000; spending is 7500; push notifications enabled |
| **Test Steps** | 1. Add Food transaction: 500 (total = 8000) <br> 2. Approve transaction <br> 3. Check for push notification |
| **Expected Output** | ✓ Push notification sent: "Food budget 80% spent" <br> ✓ Notification can be tapped to view budget <br> ✓ Alert only sent once (not repeatedly) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach push notification screenshot]* |

### Test Case 5.4: Budget Alert at 90% Threshold

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-004 |
| **Description** | System sends alert notification when budget reaches 90% |
| **Preconditions** | Budget: Food 10000; spending is 8000 |
| **Test Steps** | 1. Add Food transaction: 500 (total = 8500) <br> 2. Add another: 500 (total = 9000) <br> 3. Approve second transaction <br> 4. Check notifications |
| **Expected Output** | ✓ Push notification sent: "Food budget 90% spent" <br> ✓ Warning tone or emphasis <br> ✓ Distinct from 80% alert |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach 90% alert notification]* |

### Test Case 5.5: Exceed Budget Limit

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-005 |
| **Description** | User can exceed budget; system warns and tracks overspending |
| **Preconditions** | Budget: Food 10000; spending is 9500 |
| **Test Steps** | 1. Add Food transaction: 1000 (total = 10500) <br> 2. Approve transaction |
| **Expected Output** | ✓ Transaction approved (not blocked) <br> ✓ Budget shows: 10500 / 10000 (105%) <br> ✓ Progress bar shows overspent (red) <br> ✓ Overspend amount shown: 500 |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach overspent budget view]* |

### Test Case 5.6: Monthly Budget Reset

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-006 |
| **Description** | Monthly budget resets on the first day of each month |
| **Preconditions** | Budget created; month has changed |
| **Test Steps** | 1. Set current date to last day of month <br> 2. View budget (should show previous month's spending) <br> 3. Set date to first of next month <br> 4. Refresh/reopen budget |
| **Expected Output** | ✓ Budget spending reset to 0 <br> ✓ Current month transactions not included in old month <br> ✓ Progress bar reset to 0% |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget before/after reset]* |

### Test Case 5.7: Delete Budget

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-007 |
| **Description** | User can delete a budget |
| **Preconditions** | User viewing budget details |
| **Test Steps** | 1. Tap menu (three dots) <br> 2. Tap "Delete Budget" <br> 3. Confirm deletion |
| **Expected Output** | ✓ Confirmation dialog shown <br> ✓ Budget deleted <br> ✓ Removed from budgets list <br> ✓ Transactions not affected |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach deletion confirmation & list after]* |

### Test Case 5.8: Multi-wallet Budget Scope

| Field | Value |
|-------|-------|
| **Test ID** | BT-BUD-008 |
| **Description** | Budget tracks spending across all wallets for a category |
| **Preconditions** | User has 2 wallets; Budget: Food 10000; transactions across both wallets |
| **Test Steps** | 1. Add Food transaction 3000 to Wallet A <br> 2. Add Food transaction 4000 to Wallet B <br> 3. Approve both <br> 4. View budget |
| **Expected Output** | ✓ Budget shows total: 7000 / 10000 <br> ✓ Includes transactions from both wallets <br> ✓ No double-counting |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget tracking across wallets]* |

---

## Section 6: Savings Goals

### Test Case 6.1: Create Savings Goal

| Field | Value |
|-------|-------|
| **Test ID** | BT-GOA-001 |
| **Description** | User can create a new savings goal with target amount and date |
| **Preconditions** | User is on goals screen |
| **Test Steps** | 1. Tap "+ Create Goal" <br> 2. Enter name: `Vacation Fund` <br> 3. Enter target amount: `50000` <br> 4. Set target date: `2026-12-31` <br> 5. Tap "Create Goal" |
| **Expected Output** | ✓ Goal created in database <br> ✓ Goal appears in list <br> ✓ Current progress: 0 / 50000 <br> ✓ Progress bar shown <br> ✓ Days to target shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach goal creation form & goal list]* |

### Test Case 6.2: Goal Progress Calculation

| Field | Value |
|-------|-------|
| **Test ID** | BT-GOA-002 |
| **Description** | Goal progress is calculated based on approved savings transactions |
| **Preconditions** | Goal: Vacation Fund, target 50000; user has saved through transactions |
| **Test Steps** | 1. Add savings transaction: 10000 <br> 2. Add savings transaction: 15000 <br> 3. Approve both <br> 4. View goal |
| **Expected Output** | ✓ Goal shows: 25000 / 50000 (50%) <br> ✓ Progress bar shows 50% <br> ✓ Updates upon transaction approval |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach goal progress at different stages]* |

### Test Case 6.3: Goal Projected Completion Date

| Field | Value |
|-------|-------|
| **Test ID** | BT-GOA-003 |
| **Description** | System calculates projected completion date based on savings rate |
| **Preconditions** | Goal created with target 50000; user has steady savings pattern |
| **Test Steps** | 1. Add monthly savings: 5000 <br> 2. System analyzes savings rate <br> 3. View goal details |
| **Expected Output** | ✓ Projected completion date calculated <br> ✓ If rate continues, shows estimated completion <br> ✓ Compared to target date: on-track / ahead / behind |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach projected completion date]* |

### Test Case 6.4: Goal Achieved

| Field | Value |
|-------|-------|
| **Test ID** | BT-GOA-004 |
| **Description** | Goal status changes when target amount reached |
| **Preconditions** | Goal: Vacation, target 50000; current progress 45000 |
| **Test Steps** | 1. Add transaction: 5000 <br> 2. Approve <br> 3. View goal |
| **Expected Output** | ✓ Goal status changed to `completed` or `achieved` <br> ✓ Progress shows 50000 / 50000 (100%) <br> ✓ Completion date shown <br> ✓ Celebration message or badge <br> ✓ Can be marked as archived |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach achieved goal state]* |

### Test Case 6.5: Delete Goal

| Field | Value |
|-------|-------|
| **Test ID** | BT-GOA-005 |
| **Description** | User can delete a goal |
| **Preconditions** | User viewing goal details |
| **Test Steps** | 1. Tap menu (three dots) <br> 2. Tap "Delete Goal" <br> 3. Confirm deletion |
| **Expected Output** | ✓ Confirmation dialog shown <br> ✓ Goal deleted from database <br> ✓ Removed from goals list |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach deletion confirmation]* |

---

## Section 7: AI Companion & Chat

### Test Case 7.1: User Initiates Chat with AI

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-001 |
| **Description** | User can start a conversation with the AI financial companion |
| **Preconditions** | User is on AI chat screen; API and workers running |
| **Test Steps** | 1. Tap on AI Companion <br> 2. Type message: `"How am I spending this month?"` <br> 3. Tap "Send" |
| **Expected Output** | ✓ Message sent to API <br> ✓ API builds context (user profile, recent transactions, budget state) <br> ✓ Claude AI generates response <br> ✓ Response streamed back and displayed <br> ✓ Response includes financial insights |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach chat message & AI response]* |

### Test Case 7.2: AI Uses Recent Financial Data in Context

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-002 |
| **Description** | AI companion has access to last 30 days of transactions for context |
| **Preconditions** | User has recent transactions; AI context built with transaction data |
| **Test Steps** | 1. Ask AI: `"What was my biggest spending category this month?"` |
| **Expected Output** | ✓ AI references actual transaction data <br> ✓ Accurate answer based on user's transactions <br> ✓ Response includes amount and date range <br> ✓ Shows understanding of user's financial state |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach AI response with data reference]* |

### Test Case 7.3: AI Provides Budget Recommendations

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-003 |
| **Description** | AI companion suggests budget adjustments based on spending patterns |
| **Preconditions** | User has multiple transactions; budget created |
| **Test Steps** | 1. Ask AI: `"Should I increase my Food budget?"` |
| **Expected Output** | ✓ AI analyzes spending pattern <br> ✓ Provides recommendation with reasoning <br> ✓ Suggests specific amount <br> ✓ Considers historical data |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach AI recommendation]* |

### Test Case 7.4: AI Learns from Companion Memory

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-004 |
| **Description** | AI companion remembers user preferences and facts from previous conversations |
| **Preconditions** | User has previous chat history; companion_memory table populated |
| **Test Steps** | 1. In previous chat: mention "I love coffee" <br> 2. System stores fact in companion_memory <br> 3. Start new chat: ask "What are my spending habits?" |
| **Expected Output** | ✓ AI references previous memory: mentions coffee spending <br> ✓ Shows continuity across conversations <br> ✓ Memory confidence level shown (optional) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach chat showing memory recall]* |

### Test Case 7.5: AI Check-in Notifications

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-005 |
| **Description** | AI companion sends periodic check-in notifications |
| **Preconditions** | User has enabled check-ins; worker running |
| **Test Steps** | 1. Set check-in schedule <br> 2. Wait for scheduled check-in time <br> 3. Receive notification |
| **Expected Output** | ✓ Push notification received <br> ✓ Contains personalized financial insight <br> ✓ Can be tapped to open chat <br> ✓ Check-in marked as read |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach check-in notification]* |

### Test Case 7.6: Chat History Persistence

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-006 |
| **Description** | Chat history is saved and can be viewed later |
| **Preconditions** | User has completed multiple chats |
| **Test Steps** | 1. Open AI chat screen <br> 2. View chat history |
| **Expected Output** | ✓ All previous conversations listed <br> ✓ Each conversation shows date/time <br> ✓ Can tap to continue conversation <br> ✓ Can delete conversations |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach chat history view]* |

### Test Case 7.7: API Timeout Handling (AI Chat)

| Field | Value |
|-------|-------|
| **Test ID** | BT-AI-007 |
| **Description** | App gracefully handles AI response timeout |
| **Preconditions** | User sends message; API times out |
| **Test Steps** | 1. Send chat message <br> 2. Simulate API timeout (network issue) <br> 3. Observe error handling |
| **Expected Output** | ✗ Error message shown: "Unable to reach AI. Try again." <br> ✗ Message can be resent <br> ✗ App doesn't crash |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error message & recovery]* |

---

## Section 8: Reports & Analytics

### Test Case 8.1: Generate Monthly Spending Report

| Field | Value |
|-------|-------|
| **Test ID** | BT-REP-001 |
| **Description** | User can generate a monthly spending report |
| **Preconditions** | User is on reports screen; has transactions for current month |
| **Test Steps** | 1. Tap "Monthly Report" <br> 2. Select month: `May 2026` <br> 3. Tap "Generate" |
| **Expected Output** | ✓ Report generated with breakdown by category <br> ✓ Total spending shown <br> ✓ Charts/visualizations displayed <br> ✓ Comparison to previous month (if available) <br> ✓ Can be exported/shared |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach generated report]* |

### Test Case 8.2: Category Breakdown Visualization

| Field | Value |
|-------|-------|
| **Test ID** | BT-REP-002 |
| **Description** | Report shows spending breakdown by category with visualizations |
| **Preconditions** | Report generated with transactions in multiple categories |
| **Test Steps** | 1. View report <br> 2. Check category breakdown |
| **Expected Output** | ✓ Pie chart or bar chart shown <br> ✓ Each category labeled with amount and % <br> ✓ Top spending category highlighted <br> ✓ Can tap category to see detail |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach category breakdown visualization]* |

### Test Case 8.3: Spending Trends Over Time

| Field | Value |
|-------|-------|
| **Test ID** | BT-REP-003 |
| **Description** | User can view spending trends over multiple months |
| **Preconditions** | User has transactions over 3+ months |
| **Test Steps** | 1. Open reports <br> 2. Tap "Trends" <br> 3. Select date range: last 3 months |
| **Expected Output** | ✓ Line chart shows spending trend <br> ✓ X-axis: months, Y-axis: amount <br> ✓ Multiple categories can be toggled <br> ✓ Average/total shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach trend visualization]* |

### Test Case 8.4: Comparison to Budget

| Field | Value |
|-------|-------|
| **Test ID** | BT-REP-004 |
| **Description** | Report shows actual spending vs. budgeted amount by category |
| **Preconditions** | User has budgets and matching transactions |
| **Test Steps** | 1. View monthly report <br> 2. Check budget vs. actual comparison |
| **Expected Output** | ✓ Shows budgeted vs. actual for each category <br> ✓ Variance shown (over/under) <br> ✓ Visual indicator (red for over, green for under) <br> ✓ Total budget variance shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget comparison view]* |

### Test Case 8.5: Export Report

| Field | Value |
|-------|-------|
| **Test ID** | BT-REP-005 |
| **Description** | User can export report as PDF or CSV |
| **Preconditions** | Report generated and displayed |
| **Test Steps** | 1. Tap "Export" <br> 2. Select format: `PDF` <br> 3. Tap "Export" |
| **Expected Output** | ✓ PDF generated with all report data <br> ✓ Downloaded to device <br> ✓ Can be opened/shared <br> ✓ Formatting preserved |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach export dialog & exported file]* |

---

## Section 9: Reconciliation

### Test Case 9.1: Initiate Wallet Reconciliation

| Field | Value |
|-------|-------|
| **Test ID** | BT-REC-001 |
| **Description** | User reconciles computed balance with stated bank balance |
| **Preconditions** | User is on reconciliation screen; has wallet |
| **Test Steps** | 1. Select wallet: `Main Bank Account` <br> 2. Enter stated balance from bank: `75000` <br> 3. Tap "Reconcile" |
| **Expected Output** | ✓ App calculates computed balance (starting + approved txns) <br> ✓ Comparison shown: computed vs. stated <br> ✓ Discrepancy calculated: (computed - stated) <br> ✓ Reconciliation record created |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach reconciliation form & result]* |

### Test Case 9.2: Balanced Reconciliation

| Field | Value |
|-------|-------|
| **Test ID** | BT-REC-002 |
| **Description** | When computed and stated balances match, system confirms balance verified |
| **Preconditions** | Computed balance = 75000; user enters stated balance = 75000 |
| **Test Steps** | 1. Enter stated balance: `75000` <br> 2. Tap "Reconcile" |
| **Expected Output** | ✓ Message: "Balance verified" ✓ Green checkmark shown <br> ✓ Reconciliation recorded with discrepancy: 0 <br> ✓ No action needed |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach balanced reconciliation confirmation]* |

### Test Case 9.3: Discrepancy Detected

| Field | Value |
|-------|-------|
| **Test ID** | BT-REC-003 |
| **Description** | When balances don't match, system highlights discrepancy |
| **Preconditions** | Computed balance = 75000; user enters stated balance = 80000 |
| **Test Steps** | 1. Enter stated balance: `80000` <br> 2. Tap "Reconcile" |
| **Expected Output** | ✓ Discrepancy shown: 5000 (app under by 5000) <br> ✓ Warning message: "Balance mismatch of 5000" <br> ✓ Suggestions shown: review recent transactions, check for missing entries <br> ✓ Reconciliation recorded for audit |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach discrepancy alert]* |

### Test Case 9.4: Reconciliation History

| Field | Value |
|-------|-------|
| **Test ID** | BT-REC-004 |
| **Description** | User can view history of all reconciliations |
| **Preconditions** | User has completed multiple reconciliations |
| **Test Steps** | 1. Open wallet details <br> 2. Tap "Reconciliation History" |
| **Expected Output** | ✓ List of all reconciliations shown <br> ✓ Each shows: date, stated balance, computed balance, discrepancy <br> ✓ Sortable by date <br> ✓ Can tap to view details |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach reconciliation history]* |

---

## Section 10: Notifications & Push

### Test Case 10.1: Push Token Registration

| Field | Value |
|-------|-------|
| **Test ID** | BT-NOTIF-001 |
| **Description** | App registers device FCM token on first launch |
| **Preconditions** | App freshly installed; user logged in |
| **Test Steps** | 1. App requests push permissions <br> 2. User grants permission <br> 3. App initializes FCM <br> 4. Token sent to `PUT /users/fcm-token` |
| **Expected Output** | ✓ FCM token obtained via `getDevicePushTokenAsync()` <br> ✓ Token sent and stored in `User.fcmToken` <br> ✓ Can be used for push notifications |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach permission dialog & confirmation]* |

### Test Case 10.2: Push Notification on SMS Parsing Complete

| Field | Value |
|-------|-------|
| **Test ID** | BT-NOTIF-002 |
| **Description** | User receives push notification when SMS parsing completes |
| **Preconditions** | User pastes SMS; workers running; push enabled |
| **Test Steps** | 1. Paste SMS and parse <br> 2. Wait for worker to complete <br> 3. Check device notifications |
| **Expected Output** | ✓ Push notification received on device <br> ✓ Title: "Transactions extracted" <br> ✓ Body: shows number of transactions or categories <br> ✓ Tapping opens app to pending transactions |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach push notification]* |

### Test Case 10.3: Budget Alert Notification

| Field | Value |
|-------|-------|
| **Test ID** | BT-NOTIF-003 |
| **Description** | Push notification sent when budget reaches threshold (80% / 90%) |
| **Preconditions** | Budget 80%+ spent; push enabled |
| **Test Steps** | 1. Approve transaction that triggers 80% threshold <br> 2. Check for notification |
| **Expected Output** | ✓ Push notification sent: `"Food budget 80% spent"` <br> ✓ Tapping opens budget details |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget alert notification]* |

### Test Case 10.4: Notification Tap Handling (Pending Transactions)

| Field | Value |
|-------|-------|
| **Test ID** | BT-NOTIF-004 |
| **Description** | Tapping SMS parse notification opens pending transactions screen |
| **Preconditions** | Notification received for SMS parsing |
| **Test Steps** | 1. Receive notification for SMS parse completion <br> 2. Tap notification while app is in background |
| **Expected Output** | ✓ App opens and navigates to pending transactions <br> ✓ Relevant transactions highlighted or focused <br> ✓ Deeplink works correctly |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach deeplink navigation]* |

### Test Case 10.5: Notification Preferences Settings

| Field | Value |
|-------|-------|
| **Test ID** | BT-NOTIF-005 |
| **Description** | User can customize notification preferences |
| **Preconditions** | User is in settings |
| **Test Steps** | 1. Tap Settings <br> 2. Go to "Notifications" <br> 3. Toggle "Budget Alerts" off <br> 4. Toggle "SMS Parse Notifications" off |
| **Expected Output** | ✓ Preferences saved in database (`User.notificationPrefs` JSON) <br> ✓ Disabled notifications not sent <br> ✓ Other notifications still work |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach notification preferences screen]* |

### Test Case 10.6: No Notifications When No FCM Token

| Field | Value |
|-------|-------|
| **Test ID** | BT-NOTIF-006 |
| **Description** | System handles gracefully when FCM token not available |
| **Preconditions** | User has no FCM token (notifications denied) |
| **Test Steps** | 1. Deny push permission during setup <br> 2. Trigger event that would send notification (SMS parse) |
| **Expected Output** | ✗ Push notification not attempted <br> ✗ No errors in logs (graceful failure) <br> ✓ App logs notification intent (for monitoring) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach logs showing graceful handling]* |

---

## Section 11: Settings & User Management

### Test Case 11.1: View User Profile

| Field | Value |
|-------|-------|
| **Test ID** | BT-SET-001 |
| **Description** | User can view their profile information |
| **Preconditions** | User is logged in; on settings screen |
| **Test Steps** | 1. Tap Settings <br> 2. View profile section |
| **Expected Output** | ✓ Name displayed <br> ✓ Email displayed <br> ✓ Monthly income shown <br> ✓ Currency shown <br> ✓ Account creation date shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach profile screen]* |

### Test Case 11.2: Update User Profile

| Field | Value |
|-------|-------|
| **Test ID** | BT-SET-002 |
| **Description** | User can update profile information |
| **Preconditions** | User is viewing profile |
| **Test Steps** | 1. Tap "Edit Profile" <br> 2. Change name: `John Doe Updated` <br> 3. Change monthly income: `75000` <br> 4. Tap "Save" |
| **Expected Output** | ✓ Changes saved to database <br> ✓ AI context updated with new data <br> ✓ Success notification shown <br> ✓ Changes reflected immediately |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach profile update form & confirmation]* |

### Test Case 11.3: Change Currency Preference

| Field | Value |
|-------|-------|
| **Test ID** | BT-SET-003 |
| **Description** | User can change their default currency |
| **Preconditions** | User in profile edit screen |
| **Test Steps** | 1. Change currency: `LKR` → `USD` <br> 2. Tap "Save" |
| **Expected Output** | ✓ Currency saved to user profile <br> ✓ All amounts displayed in new currency (UI level, not conversion) <br> ✓ Reports regenerate with new currency symbol |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach currency change & updated amounts]* |

### Test Case 11.4: View App Version & Build Info

| Field | Value |
|-------|-------|
| **Test ID** | BT-SET-004 |
| **Description** | User can view app version and build information |
| **Preconditions** | User in settings |
| **Test Steps** | 1. Scroll to bottom of settings <br> 2. View "About" section |
| **Expected Output** | ✓ App version shown (e.g., 1.0.0) <br> ✓ Build number shown <br> ✓ Last update date shown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach about section]* |

### Test Case 11.5: Delete Account

| Field | Value |
|-------|-------|
| **Test ID** | BT-SET-005 |
| **Description** | User can delete their account (with confirmation) |
| **Preconditions** | User is in settings |
| **Test Steps** | 1. Tap "Delete Account" <br> 2. Read warning: "This action is irreversible" <br> 3. Enter password to confirm <br> 4. Tap "Delete" |
| **Expected Output** | ✓ Confirmation dialog with warning <br> ✓ Password verification required <br> ✓ All user data deleted (cascade) <br> ✓ Redirect to login screen <br> ✓ No way to recover account |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach deletion confirmation dialog]* |

---

# WHITE BOX TESTING — API & SERVICE LAYER

## Section 12: API Endpoint Testing

### Test Case 12.1: POST /auth/register - Valid Input

| Field | Value |
|-------|-------|
| **Test ID** | WT-AUTH-001 |
| **Description** | Registration endpoint accepts valid credentials and creates user |
| **Preconditions** | Database clean; API running |
| **Request** | `POST /auth/register` <br> Body: `{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response: `{success:true, data:{user:{id,email,name,currency,monthlyIncome}, tokens:{access,refresh}}}` <br> ✓ User created in database <br> ✓ Password hashed (bcrypt) <br> ✓ Tokens are valid JWT |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach API request/response in Postman/Insomnia]* |

### Test Case 12.2: POST /auth/register - Duplicate Email

| Field | Value |
|-------|-------|
| **Test ID** | WT-AUTH-002 |
| **Description** | Registration fails with existing email |
| **Preconditions** | User exists with email test@example.com |
| **Request** | `POST /auth/register` <br> Body: `{"email":"test@example.com","password":"Pass123!","name":"New User"}` |
| **Expected Output** | ✗ Status: 409 or 400 <br> ✗ Response: `{success:false, error:"Email already registered"}` <br> ✗ No user created |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error response]* |

### Test Case 12.3: POST /auth/login - Valid Credentials

| Field | Value |
|-------|-------|
| **Test ID** | WT-AUTH-003 |
| **Description** | Login endpoint returns valid tokens for correct credentials |
| **Preconditions** | User exists; API running |
| **Request** | `POST /auth/login` <br> Body: `{"email":"test@example.com","password":"SecurePass123!"}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response includes `tokens` with `access` and `refresh` JWT <br> ✓ Access token valid for API requests <br> ✓ Refresh token stored (or returned) <br> ✓ User object returned |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach login response]* |

### Test Case 12.4: POST /auth/login - Invalid Password

| Field | Value |
|-------|-------|
| **Test ID** | WT-AUTH-004 |
| **Description** | Login fails with incorrect password |
| **Preconditions** | User exists |
| **Request** | `POST /auth/login` <br> Body: `{"email":"test@example.com","password":"WrongPass123!"}` |
| **Expected Output** | ✗ Status: 401 <br> ✗ Response: `{success:false, error:"Invalid email or password"}` <br> ✗ No tokens returned |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error response]* |

### Test Case 12.5: GET /wallets - List All Wallets

| Field | Value |
|-------|-------|
| **Test ID** | WT-WAL-001 |
| **Description** | Fetch all wallets for authenticated user |
| **Preconditions** | User has 3 wallets; valid JWT token |
| **Request** | `GET /wallets` <br> Header: `Authorization: Bearer {accessToken}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response: `{success:true, data:{items:[...], total:3, page:1, limit:10, hasMore:false}}` <br> ✓ Each wallet includes `id`, `name`, `type`, `startingBalance`, `createdAt` <br> ✓ Balance field NOT returned (must be computed via service) <br> ✓ Only user's wallets returned (not other users') |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach API response]* |

### Test Case 12.6: GET /wallets - Unauthorized (No Token)

| Field | Value |
|-------|-------|
| **Test ID** | WT-WAL-002 |
| **Description** | Wallet endpoint requires valid JWT token |
| **Preconditions** | API running |
| **Request** | `GET /wallets` <br> (No Authorization header) |
| **Expected Output** | ✗ Status: 401 <br> ✗ Response: `{success:false, error:"Unauthorized"}` <br> ✗ No data returned |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach 401 error]* |

### Test Case 12.7: POST /wallets - Create Wallet

| Field | Value |
|-------|-------|
| **Test ID** | WT-WAL-003 |
| **Description** | Create new wallet with starting balance |
| **Preconditions** | User authenticated |
| **Request** | `POST /wallets` <br> Header: `Authorization: Bearer {token}` <br> Body: `{"name":"Main Account","type":"bank","startingBalance":100000}` |
| **Expected Output** | ✓ Status: 201 <br> ✓ Response: `{success:true, data:{wallet:{id,userId,name,type,startingBalance,createdAt}}}` <br> ✓ Wallet created in database <br> ✓ startingBalance stored correctly |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach wallet creation response]* |

### Test Case 12.8: GET /transactions - List Transactions with Pagination

| Field | Value |
|-------|-------|
| **Test ID** | WT-TRX-001 |
| **Description** | Fetch paginated list of transactions |
| **Preconditions** | User has 50 transactions; authenticated |
| **Request** | `GET /transactions?page=1&limit=10` <br> Header: `Authorization: Bearer {token}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response: `{success:true, data:{items:[...], total:50, page:1, limit:10, hasMore:true}}` <br> ✓ 10 transactions returned <br> ✓ Total count correct <br> ✓ hasMore flag correct |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach paginated response]* |

### Test Case 12.9: GET /transactions - Filter by Status

| Field | Value |
|-------|-------|
| **Test ID** | WT-TRX-002 |
| **Description** | Filter transactions by status (pending/approved/rejected) |
| **Preconditions** | User has transactions with mixed statuses |
| **Request** | `GET /transactions?status=pending` <br> Header: `Authorization: Bearer {token}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response includes only `pending` transactions <br> ✓ Other statuses excluded <br> ✓ Total count shows pending-only count |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach filtered response]* |

### Test Case 12.10: POST /transactions - Create Manual Transaction

| Field | Value |
|-------|-------|
| **Test ID** | WT-TRX-003 |
| **Description** | Create a manual transaction (instantly approved) |
| **Preconditions** | User has wallet; authenticated |
| **Request** | `POST /transactions` <br> Body: `{"walletId":"wallet-123","amount":5000,"type":"debit","category":"Food","merchant":"Pizza Hut","source":"manual"}` |
| **Expected Output** | ✓ Status: 201 <br> ✓ Transaction created with `status: approved` <br> ✓ `signedAmount: -5000` (negative for debit) <br> ✓ Wallet balance updated in next fetch <br> ✓ Source set to `manual` |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach transaction response]* |

### Test Case 12.11: PATCH /transactions/{id}/approve - Approve Pending Transaction

| Field | Value |
|-------|-------|
| **Test ID** | WT-TRX-004 |
| **Description** | Approve a pending transaction |
| **Preconditions** | Pending transaction exists; user authenticated |
| **Request** | `PATCH /transactions/{id}/approve` <br> Header: `Authorization: Bearer {token}` <br> Body: `{}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Transaction status changed to `approved` <br> ✓ `approvedAt` timestamp set <br> ✓ Wallet balance recalculated <br> ✓ Budget impact calculated |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach approval response]* |

### Test Case 12.12: PATCH /transactions/{id}/reject - Reject Pending Transaction

| Field | Value |
|-------|-------|
| **Test ID** | WT-TRX-005 |
| **Description** | Reject a pending transaction |
| **Preconditions** | Pending transaction exists |
| **Request** | `PATCH /transactions/{id}/reject` <br> Header: `Authorization: Bearer {token}` <br> Body: `{}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Transaction status changed to `rejected` <br> ✓ Wallet balance unaffected <br> ✓ Does not count toward budgets |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach rejection response]* |

### Test Case 12.13: POST /ingestion/sms - Submit SMS for Parsing

| Field | Value |
|-------|-------|
| **Test ID** | WT-ING-001 |
| **Description** | Submit SMS text for Claude AI parsing |
| **Preconditions** | User authenticated; workers running |
| **Request** | `POST /ingestion/sms` <br> Body: `{"walletId":"wallet-123","rawText":"You spent 5000 at Pizza Hut..."}` |
| **Expected Output** | ✓ Status: 202 (Accepted) <br> ✓ Response: `{success:true, data:{jobId,status:"queued"}}` <br> ✓ Job queued to BullMQ `sms-parse` queue <br> ✓ IngestionLog created with `status: queued` |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach ingestion response]* |

### Test Case 12.14: POST /ingestion/statement - Upload PDF Statement

| Field | Value |
|-------|-------|
| **Test ID** | WT-ING-002 |
| **Description** | Upload PDF for statement parsing |
| **Preconditions** | User authenticated; valid PDF file; workers running |
| **Request** | `POST /ingestion/statement` <br> Multipart form-data: <br> - file: (PDF file) <br> - walletId: wallet-123 |
| **Expected Output** | ✓ Status: 202 <br> ✓ File uploaded to Supabase Storage <br> ✓ Job queued to `statement-parse` <br> ✓ IngestionLog created <br> ✓ Response includes job ID |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach upload response]* |

### Test Case 12.15: GET /budgets - List Budgets

| Field | Value |
|-------|-------|
| **Test ID** | WT-BUD-001 |
| **Description** | Fetch all budgets for user |
| **Preconditions** | User has 3 budgets; authenticated |
| **Request** | `GET /budgets` <br> Header: `Authorization: Bearer {token}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response: `{success:true, data:{items:[...], total:3}}` <br> ✓ Each budget includes `id`, `category`, `amountLimit`, `period` <br> ✓ Current spending computed (not stored) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budgets response]* |

### Test Case 12.16: POST /budgets - Create Budget

| Field | Value |
|-------|-------|
| **Test ID** | WT-BUD-002 |
| **Description** | Create a new monthly budget |
| **Preconditions** | User authenticated |
| **Request** | `POST /budgets` <br> Body: `{"category":"Food","amountLimit":10000,"period":"monthly"}` |
| **Expected Output** | ✓ Status: 201 <br> ✓ Budget created <br> ✓ Unique constraint: (userId, category, period) enforced <br> ✓ Response includes budget ID |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach budget creation response]* |

### Test Case 12.17: POST /goals - Create Savings Goal

| Field | Value |
|-------|-------|
| **Test ID** | WT-GOA-001 |
| **Description** | Create a new savings goal |
| **Preconditions** | User authenticated |
| **Request** | `POST /goals` <br> Body: `{"name":"Vacation Fund","targetAmount":50000,"targetDate":"2026-12-31"}` |
| **Expected Output** | ✓ Status: 201 <br> ✓ Goal created with `currentAmount: 0` <br> ✓ Status set to `active` <br> ✓ Response includes goal details |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach goal creation response]* |

### Test Case 12.18: POST /ai/chat - Send Message to AI

| Field | Value |
|-------|-------|
| **Test ID** | WT-AI-001 |
| **Description** | Send message to AI companion; receive streaming response |
| **Preconditions** | User authenticated; ANTHROPIC_API_KEY set |
| **Request** | `POST /ai/chat` <br> Body: `{"message":"How much did I spend this month?"}` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response is streamed (Server-Sent Events or chunked) <br> ✓ Context includes last 30 days of transactions, user profile, budget state <br> ✓ Claude response generated and returned <br> ✓ Response contains financial insights |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach chat response]* |

### Test Case 12.19: GET /reports/monthly - Generate Monthly Report

| Field | Value |
|-------|-------|
| **Test ID** | WT-REP-001 |
| **Description** | Generate monthly spending report with breakdown |
| **Preconditions** | User has transactions; month specified |
| **Request** | `GET /reports/monthly?month=2026-05&walletId=all` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response includes: <br> - Total spending <br> - Category breakdown (amount, %) <br> - Budget comparison <br> - Comparison to previous month <br> ✓ Only approved transactions included |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach report response]* |

### Test Case 12.20: POST /reconciliation - Reconcile Wallet Balance

| Field | Value |
|-------|-------|
| **Test ID** | WT-REC-001 |
| **Description** | Reconcile computed balance with stated balance |
| **Preconditions** | User has wallet with transactions |
| **Request** | `POST /reconciliation` <br> Body: `{"walletId":"wallet-123","statedBalance":75000}` |
| **Expected Output** | ✓ Status: 201 <br> ✓ Computed balance calculated <br> ✓ Discrepancy calculated: (computed - stated) <br> ✓ Reconciliation record created <br> ✓ Response includes: computed, stated, discrepancy |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach reconciliation response]* |

---

## Section 13: Service Layer Testing

### Test Case 13.1: Wallet Balance Calculation (Ledger Service)

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-001 |
| **Description** | `computeWalletBalance()` correctly calculates balance |
| **Preconditions** | Wallet with starting_balance: 100000; 3 approved transactions (debit: 5000, credit: 15000, debit: 3000) |
| **Test Steps** | Call `computeWalletBalance(walletId)` in ledger service |
| **Expected Calculation** | Balance = 100000 + 15000 - 5000 - 3000 = 107000 <br> (Only approved transactions) |
| **Expected Output** | ✓ Returns 107000 <br> ✓ Pending/rejected transactions excluded <br> ✓ Calculation accurate |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/services/ledger.service.ts` |

### Test Case 13.2: Budget Spending Calculation (Budget Service)

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-002 |
| **Description** | `computeBudgetSpending()` calculates current month spending |
| **Preconditions** | Budget: Food category, May 2026; transactions: 3000, 2500, 4000 (all Food, approved) |
| **Test Steps** | Call `computeBudgetSpending(budgetId, currentMonth)` |
| **Expected Calculation** | Total = 3000 + 2500 + 4000 = 9500 <br> (Only current month, only approved) |
| **Expected Output** | ✓ Returns 9500 <br> ✓ Correct period filter <br> ✓ Correct category filter |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/services/budget.service.ts` |

### Test Case 13.3: Budget Alert Triggers at 80% Threshold

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-003 |
| **Description** | `checkBudgetThresholds()` triggers notification at 80% |
| **Preconditions** | Budget: Food 10000; spending 7900 (before approval of 100 transaction) |
| **Test Steps** | 1. Approve transaction 100 (new total: 8000) <br> 2. Call `checkBudgetThresholds()` <br> 3. Check for notification queue |
| **Expected Output** | ✓ 80% threshold detected (8000/10000) <br> ✓ Notification queued (not at 79% or earlier) <br> ✓ Single notification sent (not duplicate) <br> ✓ `sendNotification()` called with correct data |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/services/budget.service.ts` |

### Test Case 13.4: AI Context Building (AI Service)

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-004 |
| **Description** | `buildSystemPrompt()` correctly assembles three-layer context |
| **Preconditions** | User with name, income, currency; recent transactions; budgets; goals; memories |
| **Test Steps** | Call `buildSystemPrompt(userId)` |
| **Expected Output** | ✓ Returns string containing: <br> - Static profile (name, monthly income, currency) <br> - Rolling state (last 30 days transactions, wallet balances, budget status, active goals) <br> - Companion memories (key/value facts) <br> ✓ Context properly formatted for Claude <br> ✓ All data fetched accurately |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/modules/ai/ai.service.ts` |

### Test Case 13.5: SMS Parsing via Claude (Worker)

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-005 |
| **Description** | SMS parsing worker correctly extracts transactions from text |
| **Preconditions** | SMS text: `"You spent LKR 5000 at Colombo Super on 2026-05-20. Balance: 95000"` |
| **Test Steps** | 1. Queue SMS parse job <br> 2. Worker processes job <br> 3. Check extracted data |
| **Expected Output** | ✓ Transaction created with: <br> - amount: 5000 <br> - merchant: `Colombo Super` <br> - category: `Groceries` (inferred) <br> - transactionDate: 2026-05-20 <br> - status: `pending` <br> ✓ AI confidence scored <br> ✓ Push notification sent |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/sms-parse.worker.ts` |

### Test Case 13.6: PDF Statement Parsing via Claude (Worker)

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-006 |
| **Description** | Statement parsing worker extracts multiple transactions from PDF text |
| **Preconditions** | PDF with 3 transactions extracted as text |
| **Test Steps** | 1. Upload PDF <br> 2. Extract text via pdf-parse <br> 3. Queue to statement-parse worker <br> 4. Check extracted transactions |
| **Expected Output** | ✓ Multiple transactions created (one per line/transaction) <br> ✓ All with status: `pending` <br> ✓ All with source: `statement` <br> ✓ Single push notification for all (not per transaction) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/statement-parse.worker.ts` |

### Test Case 13.7: JWT Token Generation & Validation

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-007 |
| **Description** | Auth service correctly generates and validates JWT tokens |
| **Preconditions** | User authenticated; tokens generated |
| **Test Steps** | 1. Generate tokens (access + refresh) <br> 2. Use access token in header <br> 3. Validate via middleware |
| **Expected Output** | ✓ Access token: short expiry (15 min typical) <br> ✓ Refresh token: long expiry (7 days typical) <br> ✓ Payload includes: userId, email <br> ✓ Signature verifiable <br> ✓ Middleware accepts valid token <br> ✓ Middleware rejects invalid/expired token |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/modules/auth/auth.service.ts` |

### Test Case 13.8: Password Hashing & Verification

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-008 |
| **Description** | Auth service hashes passwords and verifies during login |
| **Preconditions** | User registered with password |
| **Test Steps** | 1. Check database: password stored as hash (not plaintext) <br> 2. Attempt login with correct password <br> 3. Verify hash matches |
| **Expected Output** | ✓ Password stored as bcrypt hash (e.g., `$2b$10$...`) <br> ✓ Plaintext never stored <br> ✓ Login verification uses bcrypt.compare() <br> ✓ Correct password validates <br> ✓ Wrong password fails validation |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/modules/auth/auth.service.ts` |

### Test Case 13.9: Transaction Isolation & Consistency

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-009 |
| **Description** | Database transactions ensure data consistency |
| **Preconditions** | Multiple concurrent operations (e.g., SMS parse while user approves different transaction) |
| **Test Steps** | 1. Simulate concurrent transaction approval <br> 2. Both should complete without conflict <br> 3. Check balance calculation |
| **Expected Output** | ✓ Both operations complete successfully <br> ✓ Balance recalculated correctly <br> ✓ No orphaned data <br> ✓ Optimistic locking or retries if needed |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/services/ledger.service.ts` |

### Test Case 13.10: Pagination Implementation

| Field | Value |
|-------|-------|
| **Test ID** | WT-SVC-010 |
| **Description** | Services correctly implement pagination for list endpoints |
| **Preconditions** | 50+ transactions in database |
| **Test Steps** | 1. Fetch transactions with page=1, limit=10 <br> 2. Fetch page=2 <br> 3. Verify offset/skip logic |
| **Expected Output** | ✓ Page 1: items 1-10, total: 50, hasMore: true <br> ✓ Page 2: items 11-20, total: 50, hasMore: true <br> ✓ Offset calculation: (page - 1) * limit <br> ✓ Last page: hasMore: false |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | Service layer (all list services) |

---

## Section 14: Middleware & Authentication Testing

### Test Case 14.1: Auth Middleware - Valid Token

| Field | Value |
|-------|-------|
| **Test ID** | WT-MW-001 |
| **Description** | Auth middleware accepts valid JWT token |
| **Preconditions** | Valid access token generated |
| **Request** | `GET /wallets` <br> Header: `Authorization: Bearer {valid_token}` |
| **Expected Output** | ✓ Middleware verifies token <br> ✓ Extracts userId from payload <br> ✓ Attaches `req.user = {userId, email}` <br> ✓ Request proceeds to handler |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/middleware/auth.ts` |

### Test Case 14.2: Auth Middleware - No Token

| Field | Value |
|-------|-------|
| **Test ID** | WT-MW-002 |
| **Description** | Auth middleware rejects request without token |
| **Preconditions** | API running |
| **Request** | `GET /wallets` <br> (No Authorization header) |
| **Expected Output** | ✗ Status: 401 <br> ✗ Response: `{success:false, error:"Unauthorized"}` <br> ✗ Request blocked (doesn't reach handler) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/middleware/auth.ts` |

### Test Case 14.3: Auth Middleware - Expired Token

| Field | Value |
|-------|-------|
| **Test ID** | WT-MW-003 |
| **Description** | Auth middleware rejects expired access token |
| **Preconditions** | Access token expired |
| **Request** | `GET /wallets` <br> Header: `Authorization: Bearer {expired_token}` |
| **Expected Output** | ✗ Status: 401 <br> ✗ Response indicates token expired <br> ✗ Client should use refresh token to get new access token |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/middleware/auth.ts` |

### Test Case 14.4: Request Validation Middleware (Zod)

| Field | Value |
|-------|-------|
| **Test ID** | WT-MW-004 |
| **Description** | Zod validation middleware rejects invalid request body |
| **Preconditions** | API running |
| **Request** | `POST /transactions` <br> Body: `{walletId:"invalid",amount:"not_a_number"}` |
| **Expected Output** | ✗ Status: 400 <br> ✗ Response: `{success:false, error:{...validation errors...}}` <br> ✗ Request doesn't reach handler |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/middleware/validation.ts` |

### Test Case 14.5: Rate Limiting Middleware

| Field | Value |
|-------|-------|
| **Test ID** | WT-MW-005 |
| **Description** | Rate limiter enforces request limits per user |
| **Preconditions** | Rate limiter configured (e.g., 100 requests/minute) |
| **Test Steps** | 1. Send 100 requests rapidly <br> 2. Send 101st request |
| **Expected Output** | ✓ First 100: Status 200 <br> ✗ 101st: Status 429 (Too Many Requests) <br> ✓ Response includes Retry-After header |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/middleware/rateLimit.ts` (if exists) |

---

## Section 15: Error Handling & Edge Cases

### Test Case 15.1: Database Connection Failure

| Field | Value |
|-------|-------|
| **Test ID** | WT-ERR-001 |
| **Description** | API gracefully handles database connection loss |
| **Preconditions** | Stop database connection |
| **Request** | `GET /wallets` with valid token |
| **Expected Output** | ✗ Status: 500 <br> ✗ Response: `{success:false, error:"Service unavailable"}` <br> ✗ No stack trace exposed <br> ✓ Error logged for debugging |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error response]* |

### Test Case 15.2: Redis Connection Failure

| Field | Value |
|-------|-------|
| **Test ID** | WT-ERR-002 |
| **Description** | Worker queue handles Redis connection loss |
| **Preconditions** | Stop Redis; try to queue SMS parse job |
| **Request** | `POST /ingestion/sms` with valid data |
| **Expected Output** | ✗ Status: 500 or 503 <br> ✗ Response indicates service unavailable <br> ✗ Graceful error message <br> ✓ Error logged |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error response]* |

### Test Case 15.3: Anthropic API Timeout (SMS Parsing)

| Field | Value |
|-------|-------|
| **Test ID** | WT-ERR-003 |
| **Description** | SMS parsing worker handles Claude API timeout |
| **Preconditions** | Anthropic API times out |
| **Test Steps** | 1. Submit SMS for parsing <br> 2. Claude API times out <br> 3. Check error handling |
| **Expected Output** | ✗ Job marked as failed in queue <br> ✗ Error logged with timestamp <br> ✗ Retry logic may trigger (configurable) <br> ✓ User notified via notification (if configured) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/sms-parse.worker.ts` |

### Test Case 15.4: Division by Zero in Calculations

| Field | Value |
|-------|-------|
| **Test ID** | WT-ERR-004 |
| **Description** | Budget spending percentage calculation handles edge case (zero limit) |
| **Preconditions** | Budget with amountLimit: 0 (hypothetical edge case) |
| **Test Steps** | Calculate percentage: (spending / amountLimit) * 100 |
| **Expected Output** | ✓ No division by zero error <br> ✓ Graceful handling (may show "N/A" or cap at 100%+) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/services/budget.service.ts` |

### Test Case 15.5: Invalid Wallet ID in Request

| Field | Value |
|-------|-------|
| **Test ID** | WT-ERR-005 |
| **Description** | API validates wallet ownership and returns 404 for non-existent wallets |
| **Preconditions** | User A tries to access wallet of User B |
| **Request** | `GET /wallets/wallet-of-user-b` <br> Header: `Authorization: Bearer {userA_token}` |
| **Expected Output** | ✗ Status: 404 (or 403) <br> ✗ Response: `{success:false, error:"Wallet not found"}` <br> ✓ No data leakage about other users' wallets |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Screenshots** | *[Attach error response]* |

### Test Case 15.6: Concurrent Transaction Approvals

| Field | Value |
|-------|-------|
| **Test ID** | WT-ERR-006 |
| **Description** | Concurrent approvals of same transaction handled correctly |
| **Preconditions** | Pending transaction; two clients try to approve simultaneously |
| **Test Steps** | 1. Client A: `PATCH /transactions/{id}/approve` <br> 2. Client B: `PATCH /transactions/{id}/approve` (same transaction, simultaneously) <br> 3. Check results |
| **Expected Output** | ✓ One approval succeeds <br> ✗ Second fails: `{error:"Transaction already approved"}` <br> ✓ Balance updated once (not double-counted) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/modules/transactions/transactions.service.ts` |

---

# DATABASE TESTING

## Section 16: Data Integrity & Relationships

### Test Case 16.1: Cascade Delete on User Deletion

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-001 |
| **Description** | Deleting user cascades to all related records |
| **Preconditions** | User has wallets, transactions, budgets, goals, etc. |
| **Test Steps** | 1. Delete user record <br> 2. Check related tables |
| **Expected Output** | ✓ All wallets deleted <br> ✓ All transactions deleted <br> ✓ All budgets deleted <br> ✓ All goals deleted <br> ✓ All companion memories deleted <br> ✓ Referential integrity maintained |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL Check** | `SELECT COUNT(*) FROM wallets WHERE user_id = 'deleted_user_id';` (should be 0) |

### Test Case 16.2: Unique Constraint: User Email

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-002 |
| **Description** | Database enforces unique email constraint |
| **Preconditions** | User exists with email test@example.com |
| **Test Steps** | 1. Attempt to insert duplicate email via raw SQL <br> 2. Check constraint violation |
| **Expected Output** | ✗ INSERT fails with unique constraint violation <br> ✗ Error: duplicate key value violates unique constraint "users_email_key" |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `INSERT INTO users (id, email, password_hash, name) VALUES (...duplicate email...);` |

### Test Case 16.3: Unique Constraint: Budget (userId, category, period)

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-003 |
| **Description** | Database prevents duplicate budgets for same user/category/period |
| **Preconditions** | User has budget: Food, Monthly |
| **Test Steps** | 1. Try to insert another budget: Food, Monthly for same user |
| **Expected Output** | ✗ INSERT fails: duplicate key violates unique constraint "budgets_user_id_category_period_key" |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `INSERT INTO budgets (user_id, category, amount_limit, period) VALUES ('user-id', 'Food', 10000, 'monthly');` (when already exists) |

### Test Case 16.4: Unique Constraint: Companion Memory (userId, key)

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-004 |
| **Description** | Database prevents duplicate memory keys for same user |
| **Preconditions** | Memory exists: userId=user1, key="favorite_food" |
| **Test Steps** | 1. Try to insert duplicate key for same user |
| **Expected Output** | ✗ INSERT fails: duplicate key constraint on (user_id, key) |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `INSERT INTO companion_memory (user_id, key, value, ...) VALUES ('user1', 'favorite_food', 'new_value', ...);` (when already exists) |

### Test Case 16.5: Foreign Key Constraint: Transaction to Wallet

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-005 |
| **Description** | Database enforces foreign key: transaction.wallet_id → wallet.id |
| **Preconditions** | No wallet with ID "fake-wallet-id" |
| **Test Steps** | 1. Try to insert transaction with invalid wallet_id |
| **Expected Output** | ✗ INSERT fails: foreign key constraint violation <br> ✗ Error: "violates foreign key constraint "transactions_wallet_id_fkey"" |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `INSERT INTO transactions (..., wallet_id) VALUES (..., 'fake-wallet-id');` |

### Test Case 16.6: Index Performance: Transactions by User & Date

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-006 |
| **Description** | Index on (user_id, transaction_date DESC) used for efficient queries |
| **Preconditions** | 100,000+ transactions in database |
| **Test Steps** | 1. Explain plan: `EXPLAIN (ANALYZE) SELECT ... FROM transactions WHERE user_id='...' ORDER BY transaction_date DESC LIMIT 10;` |
| **Expected Output** | ✓ Query plan uses index on (user_id, transaction_date DESC) <br> ✓ Execution time < 10ms <br> ✓ Few rows scanned |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 'user-id' ORDER BY transaction_date DESC LIMIT 10;` |

### Test Case 16.7: Index Performance: Transactions by User & Status

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-007 |
| **Description** | Index on (user_id, status) for filtering |
| **Preconditions** | Large transactions table |
| **Test Steps** | 1. Explain plan: filter by user_id and status |
| **Expected Output** | ✓ Index used <br> ✓ Efficient query execution |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 'user-id' AND status = 'pending';` |

### Test Case 16.8: Data Type Validation: Decimal Precision

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-008 |
| **Description** | Amount fields maintain precision (12, 2) → max 9999999999.99 |
| **Preconditions** | Database schema |
| **Test Steps** | 1. Insert transaction with amount: 1234567890.12 <br> 2. Insert with too many decimals: 1234.567 |
| **Expected Output** | ✓ First insert succeeds <br> ✗ Second insert truncated or fails (depends on system) <br> ✓ Precision maintained for financial calculations |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `INSERT INTO transactions (..., amount, signed_amount) VALUES (..., 1234567890.12, -1234567890.12);` |

### Test Case 16.9: JSON Column Storage: Metadata

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-009 |
| **Description** | JSON metadata column stores and retrieves correctly |
| **Preconditions** | Transaction created with metadata |
| **Test Steps** | 1. Store JSON metadata: `{"source":"sms","parsed_confidence":0.95}` <br> 2. Query and retrieve |
| **Expected Output** | ✓ JSON stored as JSONB <br> ✓ Retrieved with same structure <br> ✓ Can be queried with JSON operators |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `SELECT metadata FROM transactions WHERE id = '...';` |

### Test Case 16.10: Date/Time Storage: Timestamptz

| Field | Value |
|-------|-------|
| **Test ID** | WT-DB-010 |
| **Description** | Timestamps stored as timestamptz for timezone handling |
| **Preconditions** | Transactions with different timezones |
| **Test Steps** | 1. Insert transaction with created_at in UTC <br> 2. Retrieve and verify timezone |
| **Expected Output** | ✓ Timestamps stored as timestamptz (UTC) <br> ✓ Timezone info preserved <br> ✓ No ambiguity in time calculations |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **SQL** | `SELECT created_at AT TIME ZONE 'Asia/Colombo' FROM transactions LIMIT 1;` |

---

# WORKER & ASYNCHRONOUS OPERATIONS TESTING

## Section 17: BullMQ Worker Testing

### Test Case 17.1: SMS Parse Job Success

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-001 |
| **Description** | SMS parse worker completes successfully and creates transactions |
| **Preconditions** | Workers running; job queued |
| **Job Input** | `{userId, walletId, rawText: "You spent 5000 at Pizza Hut"}` |
| **Test Steps** | 1. Monitor job in BullMQ admin <br> 2. Wait for completion <br> 3. Check database |
| **Expected Output** | ✓ Job status: completed <br> ✓ Transactions created in database <br> ✓ Status: pending <br> ✓ Push notification queued <br> ✓ Execution time < 5 seconds |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/sms-parse.worker.ts` |

### Test Case 17.2: SMS Parse Job with Claude API Error

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-002 |
| **Description** | Worker handles Claude API error gracefully |
| **Preconditions** | Mock Claude API to return error; job queued |
| **Test Steps** | 1. Queue job <br> 2. Claude returns 500 error <br> 3. Check job status |
| **Expected Output** | ✓ Job marked as failed <br> ✓ Error logged with details <br> ✓ Retry may be attempted (configurable) <br> ✓ Error message stored in job data |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/sms-parse.worker.ts` |

### Test Case 17.3: Statement Parse Job (Multiple Transactions)

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-003 |
| **Description** | Statement parse worker extracts multiple transactions from PDF |
| **Preconditions** | PDF file uploaded; job queued |
| **Job Input** | `{userId, walletId, fileUrl}` |
| **Test Steps** | 1. Download file from storage <br> 2. Extract text via pdf-parse <br> 3. Send to Claude <br> 4. Create transactions |
| **Expected Output** | ✓ All transactions created with status: pending <br> ✓ Source: statement <br> ✓ Single push notification (not per transaction) <br> ✓ Job completed successfully |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/statement-parse.worker.ts` |

### Test Case 17.4: Notification Job Dispatches Push

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-004 |
| **Description** | Notification worker sends push via Firebase Admin |
| **Preconditions** | Firebase configured; FCM token registered; notification queued |
| **Job Input** | `{userId, title, body, deeplink}` |
| **Test Steps** | 1. Queue notification job <br> 2. Worker sends via Firebase Admin <br> 3. Check device receives notification |
| **Expected Output** | ✓ Job completed <br> ✓ Push received on device <br> ✓ Notification shows title & body <br> ✓ Deeplink works when tapped |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/notification.worker.ts` |

### Test Case 17.5: Notification Job Graceful Failure (No FCM Token)

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-005 |
| **Description** | Notification worker handles missing FCM token gracefully |
| **Preconditions** | User has no FCM token; notification queued |
| **Test Steps** | 1. Queue notification <br> 2. Worker tries to send <br> 3. Check error handling |
| **Expected Output** | ✓ Job marked as completed (not failed) <br> ✗ Push not sent (graceful skip) <br> ✓ Logged for monitoring <br> ✓ No exception thrown |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/workers/notification.worker.ts` |

### Test Case 17.6: Job Concurrency & Ordering

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-006 |
| **Description** | Multiple SMS parse jobs processed concurrently without conflicts |
| **Preconditions** | 5 SMS parse jobs queued for same user |
| **Test Steps** | 1. Queue 5 jobs <br> 2. Monitor execution <br> 3. Check results |
| **Expected Output** | ✓ Jobs processed in parallel (configurable concurrency) <br> ✓ All complete successfully <br> ✓ All transactions created <br> ✓ No orphaned jobs |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | `server/src/config/queues.ts` |

### Test Case 17.7: Dead Letter Queue (Failed Jobs)

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-007 |
| **Description** | Permanently failed jobs moved to dead letter queue |
| **Preconditions** | Job fails max retries (e.g., 3) |
| **Test Steps** | 1. Queue job that will fail <br> 2. Fail 3 times <br> 3. Check dead letter queue |
| **Expected Output** | ✓ Job moved to DLQ after max retries <br> ✓ Can be reviewed/retried manually <br> ✓ Alert/log for ops |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | BullMQ configuration |

### Test Case 17.8: Worker Health Check

| Field | Value |
|-------|-------|
| **Test ID** | WT-WRK-008 |
| **Description** | Endpoint to check worker status |
| **Preconditions** | Workers running |
| **Request** | `GET /health/workers` |
| **Expected Output** | ✓ Status: 200 <br> ✓ Response: `{workers:[{name,active,delayed,waiting,failed}]}` <br> ✓ Shows queue counts |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | Health check endpoint |

---

## Section 18: Offline & Sync Testing

### Test Case 18.1: Offline Transaction Queueing

| Field | Value |
|-------|-------|
| **Test ID** | WT-OFF-001 |
| **Description** | Mobile app queues transactions when offline |
| **Preconditions** | Network disabled; app running |
| **Test Steps** | 1. Disable network <br> 2. Add transaction <br> 3. Enable network <br> 4. Check sync |
| **Expected Output** | ✓ Transaction queued locally (AsyncStorage or similar) <br> ✓ UI shows "pending sync" indicator <br> ✓ Network enabled: auto-sync occurs <br> ✓ Transaction sent to API |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | Mobile: offline queue / sync logic |

### Test Case 18.2: Offline Chat Message Queueing

| Field | Value |
|-------|-------|
| **Test ID** | WT-OFF-002 |
| **Description** | Chat messages queued locally when offline |
| **Preconditions** | Network disabled; in AI chat |
| **Test Steps** | 1. Disable network <br> 2. Type and send message <br> 3. Enable network |
| **Expected Output** | ✓ Message queued locally <br> ✓ Sent when network returns <br> ✓ Response received and displayed |
| **Actual Output** | *[To be filled during testing]* |
| **Status** | Pending |
| **Code Location** | Mobile: chat sync logic |

---

# SUMMARY & ADDITIONAL NOTES

## Test Execution Guidelines

1. **Test Environment Setup**
   - Ensure Docker services running: `npm run infra:up`
   - Start API: `npm run dev:server`
   - Start Workers: `npm run dev:workers`
   - Start Mobile: `npm run dev:mobile`
   - All with valid environment variables configured

2. **Test Data Preparation**
   - Use seeding: `npm run db:seed` (if available)
   - Create test users with various states
   - Populate test transactions, budgets, goals

3. **Tools & Logging**
   - API Testing: Postman, Insomnia, curl
   - Mobile Testing: Expo Go, iOS/Android Simulator
   - Database: Prisma Studio (`npx prisma studio` from `server/`)
   - Logs: Check console output, database logs

4. **Screenshots & Evidence**
   - Capture screens for pass/fail evidence
   - Include API responses (redacted if sensitive)
   - Database query results for integrity tests
   - Network logs for timing/error analysis

5. **Regression Testing**
   - Re-run critical tests after code changes
   - Automate via CI/CD if possible
   - Keep test results for trend analysis

## Known Limitations & Future Improvements

- **AI confidence**: Currently scored by Claude; may need calibration
- **Reconciliation discrepancy resolution**: Requires manual user intervention
- **Notifications**: Firebase fallback to logging if not configured
- **Statement parsing**: Depends on PDF quality and structure
- **Budget rollover**: Monthly reset logic; yearly/quarterly not yet implemented

## Sign-off & Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | - | - | - |
| Product Manager | - | - | - |
| Development Lead | - | - | - |

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-21  
**Test Scope:** FinPal v1.0 (Authentication, Wallets, Transactions, SMS/PDF Ingestion, Budgets, Goals, AI Companion, Reports, Reconciliation, Push Notifications)

