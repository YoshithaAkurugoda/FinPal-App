# FinPal Sprint-Specific Prompts

Use these prompts at the start of each sprint to ensure consistency and proper implementation.

---

## SPRINT 1: PROJECT SETUP & PLANNING (16-22 Mar)

**Lead**: Yoshitha

```
I'm starting the FinPal project setup. Please initialize everything:

1. Create the complete React Native project structure with:
   - TypeScript configuration
   - Redux Toolkit with auth, wallets, transactions, budgets, goals slices
   - React Navigation setup (Stack, Tab, Drawer)
   - All config files (eslint, prettier, package.json)
   
2. Create all folders as per architecture:
   - screens/ (auth, wallets, transactions, budgets, goals, ai, reconciliation, reports)
   - components/ (reusable components)
   - services/ (auth, wallet, transaction, budget, goal, ai, notification services)
   - types/ (all TypeScript interfaces)
   - redux/ (store, slices, hooks)
   - utils/ (validators, formatters, calculations)
   - config/ (API, app, AI config)

3. Create base implementations:
   - ApiClient service with authentication handling
   - AuthService for login/register/logout
   - Token management with secure storage
   - Error handling utilities
   - Logger utility

4. Define all core types:
   - User, Wallet, Transaction, Budget, SavingsGoal, ReconciliationRecord
   - All enums (TransactionStatus, TransactionCategory, etc.)
   - API request/response types

5. Create documentation:
   - ARCHITECTURE.md with folder structure and patterns
   - SETUP.md with environment setup
   - DEVELOPMENT_CHECKLIST.md with coding standards
   - API_DOCUMENTATION.md template

6. Initialize git:
   - Create .gitignore for React Native
   - Create .env.example with all required variables
   - Initial commit

Ensure all code follows the patterns and standards specified in the FinPal master prompt.
```

---

## SPRINT 2: USER ACCOUNTS & ONBOARDING (23-29 Mar)

**Lead**: Elisha

```
I'm building user authentication and onboarding for FinPal.

### Features to implement:
- LoginScreen: Email and password login
- RegisterScreen: Create new account
- OnboardingFlow: Collect name, monthly income, starting wallet balance, first savings goal
- Secure session management with token persistence
- Logout functionality

### Requirements:
- All screens must follow the component structure pattern
- Use Redux for auth state management
- Use AuthService for API calls
- Implement proper error handling and validation
- Add loading states and error messages
- Sessions persist across app restarts
- Token rotation on login refresh
- Input validation (email format, password strength)

### Expected Screens:
1. LoginScreen
   - Email input
   - Password input
   - Login button
   - Link to register
   - Error display
   - Loading state

2. RegisterScreen
   - Email input
   - Password input
   - Confirm password input
   - Register button
   - Link to login
   - Validation messages
   - Terms acceptance

3. OnboardingFlow (4 screens)
   - Welcome screen
   - Name collection
   - Income collection
   - First wallet or goal setup
   - Completion screen

### Integration:
- Root navigator should check auth state and route accordingly
- Token stored in secure device storage
- Redux authSlice tracks login state

### Testing:
- Test successful login
- Test login with invalid credentials
- Test registration flow
- Test token persistence
- Test logout and redirect to login

Please provide complete implementation for all screens, updated AuthService, Redux auth slice, and integration instructions.
```

---

## SPRINT 3: WALLETS & TRANSACTION ENTRY (30 Mar-5 Apr)

**Lead**: Elisha

```
I'm building wallet management and manual transaction entry for FinPal.

### Features to implement:
- WalletListScreen: View all wallets with balances
- AddWalletScreen: Create bank account, cash, or e-wallet
- WalletDetailsScreen: View wallet transactions and history
- TransactionListScreen: View all transactions
- ManualTransactionEntryScreen: Enter transaction manually
- PendingTransactionsScreen: Approve/reject pending transactions
- Automatic balance calculation from transaction history

### Critical Requirements:
- Wallet balance is NEVER stored as fixed value
- Balance must be calculated from complete transaction history on every load
- Category suggestions based on merchant name
- Transactions start as PENDING until approved
- User can edit merchant, amount, category before approval
- User can reject pending transaction
- Transaction list filters by date range and category

### Expected Screens:

1. WalletListScreen
   - List all wallets with calculated balances
   - Wallet type icon (bank, cash, e-wallet)
   - Starting balance badge
   - Tap to view details
   - Button to add new wallet
   - Total all wallets balance

2. AddWalletScreen
   - Wallet name input
   - Wallet type selector (Bank Account, Cash, E-wallet)
   - Starting balance input
   - Create button
   - Cancel button

3. WalletDetailsScreen
   - Wallet name and type
   - Current calculated balance
   - Recent transactions (limit 10)
   - View all transactions button
   - Add transaction button
   - Edit wallet option
   - Delete wallet option

4. ManualTransactionEntryScreen
   - Amount input (with currency)
   - Merchant name input
   - Category dropdown with smart suggestions
   - Date picker (default to today)
   - Notes field (optional)
   - Save button
   - Input validation
   - Loading state while saving

5. PendingTransactionsScreen
   - List all pending transactions
   - Transaction card shows: merchant, category (suggested), amount, date, source
   - Edit button (opens edit form)
   - Approve button (moves to approved)
   - Reject button (removes from list)
   - Empty state message

6. TransactionListScreen
   - All transactions (approved + pending)
   - Filter by date range
   - Filter by category
   - Search by merchant
   - Transaction detail on tap
   - Sort by date or amount

### Integration:
- Update Redux with walletSlice and transactionSlice
- Create WalletService for API calls
- Create TransactionService for API calls
- Implement balance calculation utility
- Update root navigator with wallet screens

### Data Models:
- Wallet: id, userId, name, type, startingBalance, createdAt
- Transaction: id, walletId, userId, amount, merchant, category, date, status (PENDING/APPROVED/REJECTED), source

### Testing:
- Create wallet with starting balance
- Verify balance stays fixed, calculated from transactions
- Manual transaction entry complete in < 15 seconds
- Edit and approve pending transaction
- Reject transaction
- Filter transactions by category and date
- View wallet transaction history

Please provide complete implementation for all screens, Redux slices, services, balance calculation utility, and integration instructions.
```

---

## SPRINT 4: AUTOMATIC TRANSACTION CAPTURE (6-12 Apr)

**Lead**: Sethul (with Akindu, Elisha, Abdul)

```
I'm implementing automatic transaction capture for FinPal via SMS forwarding and PDF uploads.

### Features to implement:
- SMS message forwarding capture
- PDF bank statement upload
- AI transaction parsing and categorization
- Transaction pending approval workflow
- Integration with existing transaction system

### Critical Requirements:
- Process SMS to approved transaction in < 10 seconds
- AI reads and categorizes transaction automatically
- All captured transactions appear as PENDING
- Original message saved as read-only reference
- Captured transactions appear in pending approval screen
- Must handle multiple transaction formats from different banks
- PDF text extraction and parsing
- Merchant name normalization
- Smart category suggestion
- Duplicate detection (same amount, merchant, date within 24h)

### Frontend Screens:

1. SMSForwardingScreen
   - Instructions on how to forward bank SMS
   - Bank name field (optional)
   - Display message format expected
   - Link to create SMS contact shortcut
   - Loading indicator while processing
   - Success message after processing
   - Error handling for failed parses

2. PDFUploadScreen
   - File picker for PDF selection
   - PDF preview/confirmation
   - Upload progress bar
   - List of transactions extracted from PDF
   - Preview before approving
   - Submit button
   - Error handling

### Backend Processing:

1. SMS Forwarding Handler
   - Receive SMS webhook or message forward
   - Extract transaction details (amount, merchant, date)
   - Use AI to parse and categorize
   - Create PENDING transaction
   - Notify user
   - Return confirmation

2. PDF Upload Handler
   - Extract text from PDF
   - Parse transaction table/list
   - For each transaction: extract amount, merchant, date
   - Use AI to categorize each
   - Create PENDING transactions
   - Notify user with transaction count

3. AI Parsing Service
   - Accept unstructured transaction text
   - Extract: amount, merchant/description, date (if present)
   - Suggest category from fixed set
   - Normalize merchant name
   - Return structured transaction object
   - Handle edge cases and errors

### Integration:
- Update TransactionService with SMS and PDF handlers
- Create TransactionParsingService for AI processing
- Add transaction pending approval flow
- Integrate with existing transaction list/approval
- Add notification for new pending transactions
- Update Redux transaction slice

### Messages & Formats to Handle:
Examples:
- "Payment of LKR 1500 to ABC Store on 15/03/2026"
- "Your account XXXXXX2847 has been debited with LKR 2500 at XYZ Supermarket"
- "Transaction: Salary credited LKR 50000 to account XXXXXX2847"

### Error Handling:
- Parse failures: notify user, prompt manual entry
- Duplicate transactions: warn user, allow duplicate or skip
- Unclear categories: allow user to select on approval
- Network failures: queue for retry

### Testing:
- Forward various bank SMS messages
- Verify parsing accuracy
- Test PDF upload with multi-page statement
- Verify pending transactions list updates
- Test approval/rejection of captured transactions
- Verify transaction appears in wallet balance calculation
- Test error scenarios

### Performance:
- SMS to pending transaction: < 10 seconds
- PDF upload and parsing: < 30 seconds for typical statement

Please provide complete implementation for:
1. SMS forwarding endpoint and handler
2. PDF upload endpoint and handler
3. Transaction parsing AI service
4. SMSForwardingScreen and PDFUploadScreen
5. Updated TransactionService
6. Updated Redux transaction slice
7. Integration with existing screens
8. Test cases and error scenarios
```

---

## SPRINT 5: BUDGET TRACKING (13-19 Apr)

**Lead**: Sethul (with Yoshitha, Elisha, Abdul)

```
I'm implementing real-time budget tracking for FinPal.

### Features to implement:
- Budget limit creation per category
- Real-time spending tracking
- Budget warnings at 80% and 90%
- Category drill-down to see merchants
- Optional budget rollover
- Budget rebalancing suggestions
- Push notifications for alerts

### Critical Requirements:
- Monthly or weekly budget periods
- Budget limits per category (Groceries, Dining, Transport, Health, Shopping, Entertainment, Utilities, Savings, Transfer, Other)
- Real-time calculation of spent vs budget
- Instant alerts when approaching limits
- Drill-down shows all transactions by merchant
- Notifications at 80% and 90% thresholds
- Rollover feature (optional): carry forward unspent budget

### Expected Screens:

1. BudgetListScreen
   - List all active budgets
   - Show category, limit amount, spent amount
   - Progress bar showing percentage of budget used
   - Color coding: green (0-79%), yellow (80-89%), red (90%+)
   - Create new budget button
   - Edit button per budget
   - Delete button per budget
   - Show next budget period date

2. SetBudgetLimitScreen
   - Category selector dropdown
   - Budget period selector (Weekly / Monthly)
   - Limit amount input
   - Enable rollover toggle (optional)
   - Save button
   - Cancel button
   - Show recommended amounts based on history (optional)

3. BudgetDetailScreen
   - Category name and period
   - Budget limit amount
   - Total spent so far
   - Remaining budget
   - Progress bar with color coding
   - Large visual indicator
   - Transactions contributing to this budget
   - Drill-down by merchant
   - Spent breakdown by merchant

4. BudgetAlertScreen (triggered by push notification)
   - Alert type (80% / 90%)
   - Category name
   - Current spent / limit
   - Action button to view budget details
   - Dismiss button

### Backend Calculations:

1. Budget Status
   - For each budget: sum all APPROVED transactions in category for period
   - Calculate percentage: (spent / limit) * 100
   - Determine alert status (0-79%, 80-89%, 90-100%, over)

2. Merchant Breakdown
   - For budget detail: group transactions by merchant
   - Calculate amount per merchant
   - Sort by amount descending

3. Real-time Updates
   - On transaction approval: check all budgets
   - If any budget reaches 80% or 90%: send notification
   - Update UI immediately

### Notifications:
- "You've spent 80% of your Dining budget (LKR 4000 / LKR 5000)"
- "You've spent 90% of your Groceries budget (LKR 4500 / LKR 5000)"
- Include category, amounts, and action button

### Integration:
- Create BudgetService for API calls
- Create BudgetSlice in Redux
- Update TransactionService to trigger budget checks
- Integrate with notification service
- Update relevant screens

### Data Models:
- Budget: id, userId, category, period (WEEKLY/MONTHLY), limitAmount, enableRollover, createdAt
- BudgetStatus: (calculated) spent, remaining, percentage, alertStatus

### Testing:
- Create budget with limit
- Add transactions and verify spent calculation updates
- Test 80% and 90% notifications
- Verify drill-down shows all merchants
- Test budget rollover feature
- Test weekly and monthly periods
- Test multiple budgets simultaneously

Please provide complete implementation for:
1. BudgetListScreen, SetBudgetLimitScreen, BudgetDetailScreen
2. BudgetService with all CRUD operations
3. Budget status calculation logic
4. Notification integration
5. Redux BudgetSlice
6. Transaction approval triggering budget checks
7. Test cases
```

---

## SPRINT 6: SAVINGS GOALS (20-26 Apr)

**Lead**: Abdul (with Elisha, Yoshitha, Sethul)

```
I'm implementing savings goals with AI-projected completion for FinPal.

### Features to implement:
- Create named savings goals with target and deadline
- Log contributions toward goals
- AI-projected completion date
- Milestone celebrations (25%, 50%, 75%, 100%)
- Goal progress tracking
- Archive completed goals

### Critical Requirements:
- Goal has: name, target amount, optional deadline, current progress
- AI projects completion based on recent saving behavior
- Contributions can be logged manually or from designated transactions
- Milestones celebrate at 25%, 50%, 75%, 100%
- Push notifications on milestone achievement
- If deadline is set: calculate weekly/monthly savings target
- Projected completion date updates as user saves
- Completed goals can be archived with history preserved

### Expected Screens:

1. GoalListScreen
   - List all active goals
   - Goal card shows: name, progress bar, target amount
   - Progress percentage
   - Monthly/weekly savings target (if deadline set)
   - Projected completion date (AI calculated)
   - Create new goal button
   - Tap to view details
   - Complete/archive button when 100%

2. CreateGoalScreen
   - Goal name input
   - Target amount input
   - Optional deadline date picker
   - Start date (default: today)
   - Initial contribution amount (optional)
   - Save button
   - Input validation
   - Show estimated weekly/monthly amount needed

3. GoalDetailsScreen
   - Goal name and target amount
   - Visual progress to target (circular or bar)
   - Current amount saved
   - Remaining amount
   - If deadline set:
     - Days remaining
     - Weekly savings target
     - Monthly savings target
   - AI Projected completion date
   - List of contributions with dates and amounts
   - Add contribution button
   - Edit goal button
   - Delete goal button

4. GoalMilestoneScreen (celebration UI)
   - Large celebration icon/animation
   - "You've reached 25% / 50% / 75% / 100% of your [Goal Name]!"
   - Current amount / target amount
   - Encouraging message
   - Continue button
   - Share button (optional)

5. ContributionLogScreen
   - Amount input
   - Date picker (default: today)
   - Notes field (optional)
   - Save button
   - Cancel button

### Backend Calculations:

1. AI Projected Completion
   - Analyze recent contribution history (last 30 days)
   - Calculate average weekly savings
   - Calculate average monthly savings
   - Project: (remaining amount) / (average savings rate) = weeks/months to completion
   - If deadline exists: check if pace matches deadline
   - Warn if pace won't meet deadline

2. Milestone Tracking
   - Track: 25%, 50%, 75%, 100% achieved
   - Send notification on first achievement of each level
   - Don't re-notify if user goes down and back up

3. Weekly/Monthly Targets
   - If deadline set: (remaining amount) / (weeks/months remaining) = target
   - Display this to user
   - Update weekly as time passes

### Notifications:
- "🎉 You've reached 25% of your [Goal Name]! Keep it up!"
- "🎉 You've reached 50% of your [Goal Name]!"
- "🎉 You've reached 75% of your [Goal Name]! Almost there!"
- "🎉 Goal achieved! You've completed [Goal Name]!"

### Integration:
- Create GoalService for API calls
- Create GoalSlice in Redux
- Implement AI projection calculation service
- Integrate milestone tracking
- Integrate notifications
- Update navigation to include goal screens

### Data Models:
- SavingsGoal: id, userId, name, targetAmount, currentAmount, deadline (nullable), startDate, status (ACTIVE/COMPLETED/ARCHIVED), projectedCompletionDate, createdAt
- GoalContribution: id, goalId, amount, date, notes, createdAt
- MilestoneAchievement: id, goalId, milestonePercentage, achievedAt

### Testing:
- Create goal with and without deadline
- Log contributions
- Verify progress updates
- Test milestone notifications (25%, 50%, 75%, 100%)
- Verify AI projected completion date
- Test weekly/monthly target calculations
- Test goal completion and archiving
- Test contribution history display

Please provide complete implementation for:
1. All goal screens
2. GoalService with projections
3. Contribution logging and history
4. Milestone tracking and notifications
5. Redux GoalSlice
6. AI projection calculation logic
7. Test cases
```

---

## SPRINT 7: AI FINANCIAL COMPANION (27 Apr-3 May)

**Lead**: Akindu (with Elisha, Yoshitha)

```
I'm implementing the AI financial companion for FinPal.

### Features to implement:
- Daily morning check-in notification and screen
- Weekly Sunday summary
- Open conversational chat interface
- Personalized insights based on user data
- Proactive surplus savings suggestions
- Unusual transaction flagging
- Behavioral learning and pattern retention

### Critical Requirements:
- Daily check-in at 9 AM with previous day's summary
- Weekly summary every Sunday with top categories, largest transaction, goal progress
- Chat interface for Q&A grounded in user's financial data
- AI has access to: balances, budgets, goals, spending trends, behavioral patterns
- All AI output is read-only, no automated actions
- Responses use user's actual financial context
- Flagging for unusual transactions (higher than normal amount or unfamiliar merchant)
- Learn and retain behavior patterns for personalization

### Expected Screens:

1. AICompanionScreen (Chat)
   - Chat message history
   - User message input field
   - Send button
   - Typing indicator
   - AI responses with formatting
   - Scroll to latest message
   - Loading state
   - Error handling
   - Copy message button
   - Tap to see insights button

2. DailyCheckInScreen
   - Greeting with user name
   - Yesterday's spending summary
   - Top category yesterday
   - Largest transaction yesterday
   - Budget status (which budgets near limit)
   - Goal progress summary
   - Savings recommendation
   - Call-to-action button to view details
   - Message timestamp

3. WeeklySummaryScreen
   - Week date range
   - Total spent
   - Top spending category with amount
   - Largest transaction with merchant and amount
   - All goal progress for the week
   - Trend analysis (spending up/down vs last week)
   - Budget status
   - Savings recommendations
   - Encouraging message

4. InsightsScreen (shown from chat)
   - Title of the insight
   - Detailed explanation
   - Supporting data (transactions, amounts, percentages)
   - Suggestions for improvement
   - Back button

### AI Companion Capabilities:

1. Daily Check-in (triggered at 9 AM)
   - "Hi [Name]! Here's yesterday's financial summary:"
   - Yesterday's total spending
   - Top category
   - Largest transaction
   - Budget status
   - Goal progress if any contributions
   - Positive reinforcement or gentle suggestion

2. Weekly Summary (triggered Sunday at 9 AM)
   - "Here's your financial week in review:"
   - Total spent this week
   - Top spending category
   - Largest transaction
   - All goal progress
   - Savings recommendations
   - Trend comparison (vs last week)
   - Encouragement

3. Chat Conversations
   - "How much did I spend on Dining this month?"
   - "Am I on track for my [Goal] savings goal?"
   - "What was my biggest expense this week?"
   - "Should I increase my Groceries budget?"
   - "How much am I saving on average?"
   - "When will I reach my [Goal]?"
   - AI responds with actual user data

4. Proactive Suggestions
   - When budget period ends with surplus: "You have LKR 2000 left in your Utilities budget. Consider moving this to your [Goal]!"
   - When spending is higher than usual: "Your Dining spending this week is 40% higher than usual. Want to adjust your budget?"
   - When savings pace is good: "Great job! At your current rate, you'll reach [Goal] by [Date]!"

5. Unusual Transaction Flagging
   - "I noticed you spent LKR 50000 on Shopping today. Is this a one-time purchase or should we adjust your budget?"
   - "You transacted with 'Tesla Energy Solutions' for the first time. Is this a new merchant?"

### Backend AI Service:

1. Context Assembly
   - Get user's wallets and current balances
   - Get all budgets and current spending
   - Get all goals and progress
   - Get spending trends (last 7 days, 30 days, 90 days)
   - Get behavioral patterns (typical spending by category and merchant)
   - Get recent transactions
   - Get goal deadlines and projections

2. Insight Generation
   - Analyze patterns in context data
   - Identify trends (up/down/stable)
   - Identify anomalies (unusual transactions)
   - Generate suggestions and insights
   - Create encouraging messages

3. Conversational Response
   - Receive user question/message
   - Assemble relevant context
   - Call LLM with context and message
   - Return response
   - Log interaction

4. Message Parsing
   - Receive plain language message
   - Parse intent (query about category, goal, spending, etc.)
   - Extract entities (category name, goal name, timeframe)
   - Look up relevant data
   - Generate appropriate response

### Integration:
- Create AICompanionService for API calls
- Create AIContextService for assembling financial context
- Set up notification scheduling for check-ins and summaries
- Create AI screens and components
- Update navigation
- Create Redux slice for AI interactions

### Data Models:
- AIInteraction: id, userId, type (DAILY_CHECKIN, WEEKLY_SUMMARY, CHAT, INSIGHT), message, response, contextData, createdAt
- BehavioralPattern: id, userId, category, avgMonthlySpend, avgWeeklySpend, typicalMerchants, lastUpdated

### Notifications:
- Daily check-in at 9 AM with message preview
- Weekly summary Sunday at 9 AM
- Alert for unusual spending
- Goal milestone celebrations

### Testing:
- Test daily check-in generation with various user scenarios
- Test weekly summary accuracy
- Test chat with financial questions
- Test context assembly includes all relevant data
- Test unusual transaction detection
- Test behavioral pattern learning
- Test notification scheduling

### Performance:
- AI response time: < 3 seconds for chat
- Daily check-in generation: < 5 seconds
- Weekly summary generation: < 5 seconds

Please provide complete implementation for:
1. All AI screens
2. AICompanionService with context assembly
3. Daily check-in and weekly summary generation
4. Chat interface and response handling
5. Unusual transaction flagging
6. Behavioral pattern learning
7. Notification scheduling
8. Redux AI slice
9. Integration with existing features
10. Test cases
```

---

## SPRINT 8: NOTIFICATIONS, REPORTS & RECONCILIATION (4-10 May)

**Lead**: Akindu (with Sethul, Yoshitha, Elisha)

```
I'm implementing push notifications, spending reports, and monthly reconciliation for FinPal.

### Features to implement:
- Cross-platform push notifications
- Monthly spending report with charts
- Month-over-month comparison
- Merchant analysis
- Savings trend visualization
- Monthly balance reconciliation
- Class presentation preparation

### Notifications to Implement:
1. Budget warnings (80%, 90%) - immediate
2. Daily AI check-in (9 AM) - scheduled
3. Weekly summary (Sunday 9 AM) - scheduled
4. Goal milestones (25%, 50%, 75%, 100%) - immediate
5. Monthly reconciliation reminder (first of month) - scheduled
6. New pending transaction approval needed - immediate

### Expected Screens:

1. SpendingReportScreen
   - Month selector (dropdown or date picker)
   - Total spent this month
   - Total budgeted amount
   - Total income
   - Spending as % of income
   - Category breakdown bar chart
   - Top 5 categories by amount
   - Total remaining budget

2. CategoryBreakdownChart
   - Bar or pie chart showing categories
   - Amount and percentage per category
   - Tap category to drill down
   - Color coding per category
   - Legend with all categories

3. MerchantAnalysisScreen
   - Category selector
   - Top merchants in selected category
   - Amount spent per merchant
   - Transaction count per merchant
   - Tap to see all transactions with that merchant
   - Sort by amount or frequency

4. TrendAnalysisScreen
   - Line chart showing spending trend
   - Select timeframe (3 months, 6 months, year)
   - Show categories as different lines or toggle view
   - Show budget limits as reference lines
   - Show goal contributions as overlay
   - Show savings rate trend

5. ReconciliationScreen
   - "Your monthly reconciliation has arrived"
   - Input field: "Enter your actual bank balance"
   - Date picker (default: today)
   - Submit button
   - Show loading state
   - Show comparison after submission

6. DiscrepancyScreen (appears if mismatch)
   - "Discrepancy found"
   - App calculated balance: LKR X
   - Your stated balance: LKR Y
   - Difference: LKR Z (positive or negative)
   - Explanation area
   - Options:
     a. Adjust app balance (accepts manual adjustment)
     b. Record as reconciliation adjustment
   - Notes field for explanation
   - Save button

### Backend Calculations:

1. Monthly Report
   - Sum all APPROVED transactions for month
   - Group by category
   - Calculate percentages
   - Compare to budgets
   - Calculate % of income

2. Merchant Analysis
   - For selected category: group transactions by merchant
   - Sum amount per merchant
   - Count transactions per merchant
   - Sort options: by amount (desc), by frequency (desc)

3. Trend Analysis
   - For each month in timeframe: calculate total spending
   - For each category: calculate monthly spending
   - Calculate goal contributions
   - Calculate savings rate

4. Reconciliation
   - Get app calculated balance (sum of all transactions)
   - Compare to user stated balance
   - Calculate discrepancy
   - Log reconciliation record
   - Allow manual adjustment with explanation

### Push Notification Types:

```
{
  type: "BUDGET_WARNING",
  category: "Dining",
  percentage: 80,
  spent: 4000,
  limit: 5000,
  title: "Budget Alert",
  message: "You've spent 80% of your Dining budget"
}

{
  type: "DAILY_CHECKIN",
  date: "2026-04-10",
  message: "Your daily spending summary is ready",
  title: "Good morning, [Name]!"
}

{
  type: "GOAL_MILESTONE",
  goalId: "xyz",
  goalName: "Emergency Fund",
  milestone: 50,
  message: "You've reached 50% of your Emergency Fund goal!",
  title: "Milestone Reached! 🎉"
}

{
  type: "PENDING_APPROVAL",
  transactionCount: 3,
  message: "You have 3 transactions pending approval",
  title: "Approve Transactions"
}
```

### Integration:
- Implement push notification service
- Schedule recurring notifications (daily, weekly)
- Create report screens and charts
- Implement reconciliation workflow
- Update navigation
- Create test scenarios

### Data Models:
- No new models needed, using existing data
- ReconciliationRecord: id, userId, month, statedBalance, calculatedBalance, discrepancy, adjustment, adjustmentNote, createdAt

### Libraries for Charts:
- React Native: react-native-chart-kit or victory-native
- Or use SVG rendering with custom code

### Testing:
- Test all notification types delivery
- Test report calculations accuracy
- Test chart rendering with various data
- Test reconciliation flow
- Test discrepancy handling
- Test notification scheduling

### Presentation Preparation:
- Record video walkthrough of all features
- Prepare live demo for class
- Create presentation slides
- Document key achievements
- Plan question answers

Please provide complete implementation for:
1. All report and analysis screens
2. Push notification service with scheduling
3. Reconciliation screens and flow
4. Chart libraries and implementations
5. Integration with existing features
6. Complete notification types
7. Test cases for all features
8. Presentation video and slides
```

---

## SPRINT 9: FINAL TESTING & SUBMISSION (11 May)

**Lead**: Yoshitha (all team members)

```
I'm running final testing and submitting FinPal.

### Final Testing Checklist:

**Authentication & Onboarding**
- [ ] Register new user
- [ ] Login with credentials
- [ ] Session persists after app close
- [ ] Logout and redirect
- [ ] Onboarding completes successfully

**Wallets & Transactions**
- [ ] Create multiple wallets
- [ ] Verify balance calculation accuracy
- [ ] Manual transaction entry works
- [ ] SMS forwarding capture works
- [ ] PDF upload extract works
- [ ] Pending transactions approval works
- [ ] Transaction filters work (date, category)
- [ ] Transaction history accurate

**Budgets**
- [ ] Create budget for category
- [ ] Spend tracking accurate
- [ ] 80% notification triggers
- [ ] 90% notification triggers
- [ ] Drill-down shows merchants
- [ ] Multiple budgets work
- [ ] Budget period selection works

**Goals**
- [ ] Create goal with deadline
- [ ] Contribution logging works
- [ ] Progress calculation accurate
- [ ] Milestone celebrations trigger
- [ ] Projected completion date reasonable
- [ ] Goal archiving works

**AI Companion**
- [ ] Daily check-in arrives at 9 AM
- [ ] Weekly summary arrives Sunday 9 AM
- [ ] Chat responses are accurate
- [ ] AI has access to user context
- [ ] Unusual transaction flagging works
- [ ] Proactive suggestions appear

**Reports & Analytics**
- [ ] Monthly spending report accurate
- [ ] Charts render correctly
- [ ] Merchant analysis works
- [ ] Trend analysis displays trends
- [ ] Month-over-month comparison works

**Reconciliation**
- [ ] Monthly reconciliation prompt appears
- [ ] Discrepancy calculation correct
- [ ] Manual adjustment logging works

**Notifications**
- [ ] All notification types deliver
- [ ] Notification tapping opens correct screen
- [ ] Notification scheduling accurate
- [ ] Android and iOS notifications both work

**Performance Testing**
- [ ] App launch: < 2 seconds
- [ ] Standard requests: < 300ms
- [ ] AI response: < 3 seconds
- [ ] SMS processing: < 10 seconds
- [ ] No memory leaks during extended use

**Security Testing**
- [ ] User cannot access another user's data
- [ ] Credentials never logged
- [ ] HTTPS on all API calls
- [ ] Session tokens rotate
- [ ] Rate limiting on sensitive endpoints

**UI/UX Testing**
- [ ] All screens render on iOS and Android
- [ ] All buttons and inputs work
- [ ] Error messages are clear
- [ ] Loading states show appropriately
- [ ] No crashes or blank screens
- [ ] Accessibility standards met

### Final Documentation:
- [ ] README.md complete with setup and feature list
- [ ] ARCHITECTURE.md up to date
- [ ] API_DOCUMENTATION.md complete
- [ ] DATABASE_SCHEMA.md with sample data
- [ ] SETUP_GUIDE.md with environment setup
- [ ] DEPLOYMENT.md with deployment steps
- [ ] TESTING_REPORT.md with all test cases and results
- [ ] CHANGELOG.md with all changes
- [ ] Code comments for complex logic
- [ ] README in root with quick start

### Code Cleanup:
- [ ] No console.log statements in production code
- [ ] No unused imports
- [ ] No dead code
- [ ] Consistent code formatting
- [ ] All TypeScript types defined
- [ ] No any types without justification
- [ ] Error handling everywhere
- [ ] Proper loading and error states

### Submission Checklist:
- [ ] Source code repository with full commit history
- [ ] All deliverables in /outputs folder:
  - [ ] Mobile application APK/IPA or XCode/Android Studio project
  - [ ] Backend service with deployment instructions
  - [ ] Database schema and migrations
  - [ ] AI companion module documentation
  - [ ] Technical documentation
  - [ ] Testing report
  - [ ] Final report
  - [ ] Presentation video
  - [ ] Presentation slides
- [ ] All assignments completed:
  - [ ] Assignment 01: Project Proposal (16 Mar)
  - [ ] Assignment 02: Full Project (11 May)
  - [ ] Assignment 03: Presentation (4 May)

### Presentation Preparation:
- [ ] Record full feature walkthrough video (5-10 minutes)
- [ ] Prepare live demo with test data
- [ ] Create presentation slides covering:
  - App overview and goals
  - Architecture and technical decisions
  - Key features demonstration
  - Challenges and solutions
  - Outcomes and achievements
  - Future improvements
- [ ] Practice live demo and presentation
- [ ] Prepare answers to likely questions

### Final Delivery:
- [ ] All code committed and pushed
- [ ] All documentation finalized
- [ ] All tests passing
- [ ] No build warnings or errors
- [ ] Production builds successful
- [ ] Presentation recorded
- [ ] Team ready for live presentation

Please ensure:
1. Run comprehensive test suite
2. Fix any remaining bugs
3. Polish UI where time allows
4. Complete all documentation
5. Record presentation video
6. Prepare for live demo
7. Submit all deliverables on time

This is the final sprint. Focus on quality, completeness, and polish!
```

---

## USAGE ACROSS SPRINTS

**At start of each sprint:**
1. Use the sprint-specific prompt above
2. Include the FinPal master prompt for reference
3. Check consistency with previous sprints
4. Verify no breaking changes to existing features

**Format for Claude Code:**
```
[PASTE SPRINT-SPECIFIC PROMPT]

Reference documents:
- FinPal Master Prompt: [full prompt]
- Previous sprints completed: [list]

Please ensure:
- Consistency with existing code
- All patterns from architecture followed
- Integration with previous sprints
- Complete implementation with no partial work
```

**Between sprints:**
- Review completed work
- Document any deviations from plan
- Update CHANGELOG
- Verify test coverage
- Check for any technical debt

