# FinPal — User Manual

Welcome to FinPal, your intelligent AI-powered personal finance companion. This guide walks you through every feature, from setting up your account to mastering budgets, goals, and getting personalized financial insights.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Your First Steps](#your-first-steps)
3. [Wallets & Transactions](#wallets--transactions)
4. [Adding Transactions](#adding-transactions)
5. [Budgets](#budgets)
6. [Goals](#goals)
7. [AI Financial Companion](#ai-financial-companion)
8. [Reports & Analytics](#reports--analytics)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Download & Install

1. **Install Expo Go** (free)
   - iOS: [App Store](https://apps.apple.com/us/app/expo-go/id982107779)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Access FinPal**
   - Launch Expo Go and scan the QR code provided by your developer
   - Or sign up online at the FinPal web portal

### Create Your Account

**Step 1: Sign Up**
- Enter your **email address**
- Create a **strong password** (8+ characters, mix of letters & numbers)
- Tap **Create Account**

**Step 2: Verify Your Email**
- Check your email inbox
- Click the verification link
- Return to FinPal to log in

**Step 3: Welcome Setup**
- Enter your **full name** (used for personalized AI insights)
- Select your **currency** (e.g., USD, LKR, GBP)
- Enter your **monthly income** (optional, but recommended for budget recommendations)
- Tap **Continue**

> **💡 Tip:** Your monthly income helps FinPal's AI recommend appropriate budgets and identify spending patterns.

---

## Your First Steps

### The Home Dashboard

When you log in, you'll see:

- **Total Balance** — Your combined wallet balance (always calculated live)
- **This Month's Spending** — Total approved transactions this month
- **Budget Status** — At a glance, which budgets are on track
- **Quick Actions** — Buttons to paste SMS, upload statement, or start a chat
- **Upcoming Goals** — Progress toward your active savings goals

### Device Push Notifications

To receive real-time alerts when your AI finds transactions or budgets hit thresholds:

1. Tap **Settings** → **Notifications**
2. Toggle **Allow Notifications**
3. Follow system prompts to grant permission
4. Tapping a notification takes you directly to that transaction or budget

> **Note:** Notifications require the app to have push permission on your phone. If you denied it, you can re-enable it in your phone's **Settings** → **Apps** → **FinPal** → **Notifications**.

---

## Wallets & Transactions

### What is a Wallet?

A **wallet** is a financial account you track: a bank account, credit card, cash stash, or savings jar. Each wallet has:
- A **starting balance** (the amount you had when you started using FinPal)
- A **list of transactions** (money in and out)
- A **live balance** (calculated: starting balance + all approved transactions)

### Create Your First Wallet

1. Tap **Wallets** in the main menu
2. Tap **+ New Wallet**
3. Enter:
   - **Name** (e.g., "Checking Account", "Savings", "Cash")
   - **Starting Balance** (the balance on the day you created the wallet)
   - **Type** (Bank Account, Credit Card, Cash, or Other)
4. Tap **Create Wallet**

> **⚠️ Important:** The starting balance is a snapshot. FinPal then tracks transactions on top of that. It doesn't import historical data—only transactions you add from this point forward affect the balance.

### View & Manage Wallets

**See Your Wallets**
- Tap **Wallets** to see all wallets and their current balances
- Tap a wallet to see its transaction history

**Edit a Wallet**
- Tap the wallet → **Edit**
- Change name, starting balance, or type
- Tap **Save**

**Delete a Wallet**
- Swipe left on a wallet (or tap the menu icon)
- Tap **Delete**
- Confirm the action
- ⚠️ This removes the wallet and all its transaction history

---

## Adding Transactions

There are three ways to add transactions in FinPal:

### 1. Paste SMS Text

Best for: **Quick transaction capture** from bank SMS messages.

**How it works:**
- Your bank sends an SMS: `"Debit of Rs. 500 at SuperMart on Oct 12."`
- Copy the entire SMS
- Open FinPal → tap **+ Paste SMS**
- Paste the text
- Tap **Extract**

**What happens next:**
- FinPal's AI reads the SMS and suggests transactions
- Transactions appear as **pending** (orange badge)
- Review the extracted data (date, amount, description)
- Tap **Approve** to add it to your balance, or **Reject** to discard
- Once approved, it counts toward your budgets and balance

> **💡 Pro Tip:** The more complete your SMS, the better. Include dates, amounts, and merchant names if the bank provides them.

### 2. Upload PDF Bank Statement

Best for: **Batch importing** multiple transactions at once.

**How it works:**
1. Export a PDF statement from your bank (e.g., monthly statement)
2. Open FinPal → tap **+ Upload Statement**
3. Select the PDF file and choose which **wallet** it belongs to
4. Tap **Upload**

**What happens next:**
- FinPal queues the file for processing
- The AI extracts all transactions from the statement
- You'll receive a notification when done
- Review pending transactions and approve/reject each one
- Approved transactions immediately update your balance

> **Note:** PDF processing may take 30–60 seconds. You'll see a "Processing..." indicator. Check back in a moment.

### 3. Manually Add a Transaction

Best for: **One-off entries** or cash transactions.

**How it works:**
1. Tap **+ New Transaction** (in the Transactions or Wallet view)
2. Fill in:
   - **Wallet** — Which account this transaction belongs to
   - **Date** — When the transaction occurred
   - **Description** — What was it for? (e.g., "Coffee at Brew Café")
   - **Amount** — How much (in your currency)
   - **Type** — Income (money in) or Expense (money out)
   - **Category** — Groceries, Transport, Entertainment, etc. (optional, helps with budget tracking)
3. Tap **Add Transaction**

The transaction is **approved** immediately and affects your wallet balance right away.

### Reviewing Pending Transactions

When AI extracts transactions from SMS or PDF, they start as **pending** because AI might occasionally misread an amount or date.

**To review:**
1. Tap **Transactions** → **Pending** tab
2. Tap a transaction to view details
3. If correct, tap **Approve**
4. If wrong, tap **Edit**, fix the data, then **Approve**
5. If it's spam or a duplicate, tap **Reject**

> **Security:** Only you can approve or reject transactions. AI never auto-approves.

---

## Budgets

### What is a Budget?

A **budget** is a spending limit for a category. For example:
- "Groceries: $400/month"
- "Dining Out: $100/month"
- "Entertainment: $50/month"

FinPal tracks spending in each category and alerts you when you hit **80%** and **90%** of your limit.

### Create a Budget

1. Tap **Budgets** in the main menu
2. Tap **+ New Budget**
3. Enter:
   - **Category** — Select or create (e.g., Groceries, Transport, Utilities)
   - **Monthly Limit** — The max you want to spend (e.g., 500)
   - **Currency** — Auto-filled from your account setting
4. Tap **Create Budget**

### Track Budget Spending

**View All Budgets:**
- Tap **Budgets** to see each category's status
- Progress bars show: current spending / limit

**Example:**
```
Groceries
████░░░░░░ $280 / $400 (70%)

Dining Out
██░░░░░░░░ $18 / $100 (18%)

Entertainment
██████░░░░ $65 / $100 (65%)
```

### Budget Alerts

When you spend in a category:

- **80% threshold:** You get a notification and a gentle alert on the Budgets screen
- **90% threshold:** You get a notification and a warning alert

These alerts help you pause and decide: "Do I need to cut back this month?"

### Edit or Delete a Budget

- Tap a budget → **Edit** to change the limit
- Tap **Delete** to remove the budget

> **Note:** Deleting a budget doesn't erase transactions. You can create a new budget anytime and your past spending history will show up.

---

## Goals

### What is a Goal?

A **goal** is a savings target. Examples:
- "Save $5,000 for a vacation by December 2025"
- "Build a $2,000 emergency fund"
- "Save for a laptop upgrade: $800"

FinPal tracks your progress and celebrates when you reach milestones.

### Create a Goal

1. Tap **Goals** in the main menu
2. Tap **+ New Goal**
3. Enter:
   - **Goal Name** — What are you saving for? (e.g., "Vacation to Bali")
   - **Target Amount** — How much do you need? (e.g., 5000)
   - **Target Date** — When do you want to reach it? (e.g., Dec 31, 2025)
   - **Starting Amount** (optional) — If you've already saved some, enter it here
4. Tap **Create Goal**

### Track Goal Progress

**View All Goals:**
- Tap **Goals** to see each goal's progress

**Example:**
```
Vacation to Bali
███████░░░░ $3,500 / $5,000 (70%)
Target: Dec 31, 2025 (4 months left)

Emergency Fund
█████░░░░░░ $1,000 / $2,000 (50%)
Target: Jun 30, 2026 (13 months left)
```

### Contributing to a Goal

To add money to a goal:

1. Create a transaction or paste SMS as normal
2. When adding the transaction, link it to a goal in the **Notes** or use the AI Companion to suggest where money should go
3. Approved transactions are counted toward whichever wallet you linked them to

> **Note:** You manually decide which transactions count toward which goal (e.g., "This $200 transfer is for my vacation fund"). FinPal doesn't auto-allocate—you stay in control.

### Edit or Delete a Goal

- Tap a goal → **Edit** to change the target, date, or name
- Tap **Delete** to remove it

---

## AI Financial Companion

### Meet Your AI Assistant

FinPal's AI companion analyzes your spending, remembers your financial preferences, and gives you personalized advice. It has access to:

- **Your Profile** — Name, income, currency
- **Your Wallets & Balances** — Current money in each account
- **30 Days of Spending** — Recent transactions you've approved
- **Your Budgets & Goals** — What you're saving for
- **Your Chat History** — Conversation memory so it remembers what you discussed

### Start a Chat

1. Tap **Chat** or the **AI Assistant** button
2. Type a question or statement:
   - "How much did I spend on groceries this month?"
   - "Am I on track with my entertainment budget?"
   - "I'm planning a trip—should I adjust my savings?"
   - "Why are my Uber rides so high?"
   - "Help me plan next month's budget"

3. The AI responds with insights and recommendations

### Example Conversations

**Q:** "I spent $250 on groceries last week. Is that normal?"
**A:** "Based on your last 30 days, you've spent $890 on groceries. That's $297/week on average, so $250 is actually below your usual pace. Great job! 🎉"

---

**Q:** "What should my dining budget be?"
**A:** "You've spent $380 on dining in the last 30 days. I'd recommend a $400/month budget—it aligns with your recent behavior without being too tight. Want me to create that budget for you?"

---

**Q:** "Show me my spending by category."
**A:** "Here's your breakdown for this month:
- Groceries: $890 (45%)
- Utilities: $250 (13%)
- Transport: $200 (10%)
- Entertainment: $150 (8%)
- Dining Out: $380 (19%)
- Other: $70 (4%)

Your groceries and dining are your biggest expenses. Many people budget these two together as 'food.' Want to try that?"

---

### AI Recommendations

The AI will occasionally suggest:

- **Transactions to approve:** "I found an SMS about a $50 transaction you haven't reviewed yet."
- **Budget warnings:** "You're 89% through your entertainment budget with 8 days left."
- **Savings opportunities:** "You've spent $1,200 on Uber/transport this month—more than last month. Want to carpool or use public transit?"
- **Goal milestones:** "Congratulations! You've saved $3,000 toward your vacation—50% there!"

**Remember:** The AI suggests, but *you decide*. No transaction is final until you approve it.

### Chat Privacy

- Your chat history is private and encrypted
- The AI doesn't share your information with third parties
- You can delete conversations anytime from **Settings** → **Privacy**

---

## Reports & Analytics

### Monthly Spending Report

Get a visual breakdown of where your money goes:

1. Tap **Reports** (or **Analytics**)
2. Select **Monthly Summary**
3. View:
   - **Total Income** (transactions marked as income)
   - **Total Expenses** (transactions marked as expense)
   - **Net Savings** (income minus expenses)
   - **Category Breakdown** — Pie chart or bar chart by category
   - **Wallet Balances** — Current balance in each wallet

### Spending Trends

See how your spending changes month-to-month:

1. Tap **Reports** → **Spending Trends**
2. View a line chart showing:
   - Groceries over 3 months
   - Transport costs trending up/down
   - Dining frequency

This helps you spot patterns: "I spend more on groceries in winter" or "My transport costs jumped last month—why?"

### Budget Performance

Track how well you stick to budgets:

1. Tap **Reports** → **Budget Performance**
2. See:
   - Which budgets you nailed
   - Which ones you overshot
   - Average adherence rate

### Export Reports

Want to share with a financial advisor or just keep a record?

1. Tap **Reports** → (select a report)
2. Tap **Share** or **Export**
3. Choose format: PDF or CSV
4. Share via email, save to cloud, etc.

---

## Settings

### Account Settings

**Tap Settings → Account**
- Change your **name** or **email**
- Update your **monthly income**
- Change **currency**
- Reset **password**

### Notifications

**Tap Settings → Notifications**
- **Allow Notifications** — Toggle push alerts on/off
- **Budget Alerts** — Get notified at 80% and 90%
- **Transaction Alerts** — Get notified when AI finds new transactions
- **Goal Milestones** — Celebrate when you hit 50%, 75%, 100%

### Privacy & Security

**Tap Settings → Privacy**
- **Delete Chat History** — Clear all AI conversations
- **Two-Factor Authentication** (coming soon)
- **Manage Devices** — See where you're logged in
- **Sign Out** — Log out of this device
- **Delete Account** — Permanently erase all data

> **⚠️ Warning:** Deleting your account cannot be undone.

### App Preferences

**Tap Settings → Preferences**
- **Theme** — Light mode, dark mode, or auto
- **Language** — English, Spanish, etc. (expanding)
- **Data Refresh Interval** — How often the app syncs with the server (default: 30 seconds)

---

## Troubleshooting

### "My SMS didn't extract"

**Issue:** You pasted an SMS, but FinPal said "No transactions found."

**Causes & Solutions:**
- **SMS is from a non-bank app** — FinPal is optimized for bank SMSs. Forwarding app notifications may not have enough data.
- **SMS is too vague** — Include date, amount, and merchant. E.g., "Debit of 500 on Oct 15 at Starbucks" works; "Payment processed" does not.
- **Wrong currency or formatting** — If your bank uses Rs. instead of $, make sure your account currency matches.

**Fix:** Try rephrasing the SMS with more detail, or manually add the transaction instead.

---

### "PDF upload is stuck"

**Issue:** You uploaded a statement, but it says "Processing..." forever.

**Causes & Solutions:**
- **Server is busy** — Wait 2–3 minutes and check back.
- **File is too large or corrupted** — Try a smaller/cleaner PDF (e.g., a 1-month statement vs. a full year).
- **Internet connection dropped** — Reconnect and try uploading again.

**Fix:** Swipe down to refresh, or manually add transactions from the statement instead.

---

### "My balance doesn't match my bank"

**Issue:** FinPal shows a different balance than your real bank account.

**Causes:**
1. **Pending transactions** — Transactions you haven't approved yet don't count toward balance. Check the **Pending** tab.
2. **Missing transactions** — Did you capture all deposits and withdrawals? Check your bank app and paste/upload any missing ones.
3. **Wrong starting balance** — When you created your wallet, did you enter today's balance or an old one? If you used an old balance, add a manual transaction to correct it.
4. **Pending/disputed transactions at bank** — Some banks hold transactions for 1–2 days. They show in FinPal as soon as you add them, but not in the bank balance yet.

**Fix:**
1. Log into your actual bank app
2. Take note of the balance
3. In FinPal, check your wallet's starting balance and all transactions
4. If off, manually add a transaction to correct it (e.g., "Balance adjustment: +50")

---

### "I forgot my password"

**How to reset:**
1. On the **login screen**, tap **Forgot Password?**
2. Enter your **email address**
3. Check your email for a reset link
4. Click the link and create a **new password**
5. Log in with the new password

> **Note:** Reset links expire after 1 hour. If it's expired, request a new one.

---

### "I'm logged out on all devices"

**What happened:** You signed out or changed your password everywhere.

**How to get back in:**
1. Tap **Log In**
2. Enter your **email** and **password**
3. If you forgot the password, tap **Forgot Password?**

**To stay logged in:**
- Turn off **Auto-Logout after Inactivity** in Settings (or set it to a longer time like 30 days)

---

### "I see an error message"

**Common errors:**

| Error | Meaning | Fix |
|-------|---------|-----|
| "Network error" | No internet or server is down | Check WiFi/mobile data; try again in 1 minute |
| "Invalid email" | Email format is wrong | Use a valid email (e.g., name@gmail.com) |
| "Email already in use" | You have an account with that email | Log in instead, or use a different email |
| "File too large" | PDF is over 10 MB | Compress or use a smaller statement |
| "Budget limit too high" | You're typing too many digits | Keep limits under your wallet balance |

**Still stuck?** Tap **Settings** → **Help & Feedback** and describe the issue.

---

## Tips & Tricks

### ✨ Pro Tips

1. **Add transactions daily** — It's easier to remember details when fresh. Set a 5-minute reminder to paste your SMS before bed.

2. **Link transactions to goals** — When you transfer money to savings, make a note: "Vacation fund $100" so you know where it went.

3. **Review budgets weekly** — Every Sunday, spend 2 minutes checking if you're on track. Small adjustments early prevent month-end stress.

4. **Use the AI for insights** — Ask "Am I saving enough?" or "Where can I cut spending?" The AI spots patterns you might miss.

5. **Export monthly reports** — Save a PDF to your cloud drive. It's proof of your progress and useful for tax time.

6. **Adjust budgets quarterly** — Every 3 months, review your budgets. If you consistently undershoot or overshoot, update the limits to reality.

7. **Set multiple wallets** — Track cash separately from your bank account. It helps you see where cash disappears.

8. **Celebrate milestones** — When you reach a budget or goal milestone, take a moment to feel proud. Every $1 saved is progress.

---

### Keyboard Shortcuts (Mobile)

| Action | Shortcut |
|--------|----------|
| New transaction | Press & hold home button, say "New transaction" (if voice assistant enabled) |
| Open chat | Long press chat icon |
| View pending | Swipe left on home screen |

---

## Contact & Support

### Need Help?

- **In-app Help** — Tap **Settings** → **Help & Feedback**
- **Email Support** — support@finpal.io
- **FAQ** — finpal.io/faq
- **Report a Bug** — Tap the bug icon in Settings

---

## Security & Privacy

### How FinPal Keeps You Safe

- **Encrypted Data** — All transactions and chat are encrypted in transit and at rest
- **JWT Authentication** — Only you can access your account with your password
- **No Third-Party Sharing** — Your financial data is never sold or shared
- **Bank-Grade Security** — We use industry-standard security practices

### What FinPal Asks Permission For

- **Push Notifications** — To alert you about budgets and transactions
- **File Access** — To upload PDF statements from your phone
- **Camera** (optional) — To scan QR codes if connecting to new devices

**You can revoke any permission anytime in your phone's Settings.**

---

## Glossary

| Term | Definition |
|------|-----------|
| **Wallet** | A financial account you track (bank, credit card, cash) |
| **Transaction** | A money in or out event (debit, credit, transfer) |
| **Pending** | A transaction the AI extracted but you haven't approved yet |
| **Approved** | A transaction you confirmed; it counts toward your balance |
| **Budget** | A spending limit for a category (e.g., Groceries: $400/month) |
| **Goal** | A savings target with a deadline (e.g., Save $5,000 by Dec 2025) |
| **AI Companion** | FinPal's ChatGPT-like assistant that analyzes your finances |
| **Starting Balance** | The balance in your wallet when you first added it to FinPal |
| **Signed Amount** | Debits are negative (−$50), credits are positive (+$100) |
| **Category** | A tag for grouping transactions (Groceries, Transport, etc.) |
| **Threshold** | A spending limit that triggers an alert (80%, 90% of budget) |

---

## What's Next?

Congratulations! You now know how to:
- ✅ Create wallets and add transactions
- ✅ Set budgets and track spending
- ✅ Create goals and monitor progress
- ✅ Chat with your AI companion
- ✅ Review reports and insights

**Your next steps:**
1. Create your first wallet (if you haven't)
2. Paste your first SMS or upload a statement
3. Set up one budget that matters to you
4. Say hi to the AI Companion

And remember: the best finance app is the one you use. Check in regularly, approve transactions promptly, and watch your financial health improve over time.

---

## Feedback

**Love FinPal?** Share your thoughts and feature requests:
- Tap **Settings** → **Feedback**
- Or email: feedback@finpal.io

We read every message and use your feedback to make FinPal better.

---

**Version:** 1.0  
**Last Updated:** May 2026  
**Created by:** FinPal Team

---

*FinPal is a personal finance app for users who want to understand their money without the complexity. We're here to help you save, spend wisely, and reach your goals.*
