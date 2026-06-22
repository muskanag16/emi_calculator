# Advanced EMI Calculator & Loan Planner

A feature-rich, highly interactive EMI calculator built with modern React and Next.js. This application goes beyond simple monthly payment calculations by offering a prepayment planner, side-by-side scenario comparisons, a sensitivity grid, and seamless real-time cross-tab synchronization.

## 🚀 Key Features

### 1. Core EMI Engine
- Calculates Monthly EMI, Total Interest Payable, and Total Amount Payable using the standard reducing-balance formula.
- Visual Interest-to-Principal ratio progress bar.
- Synced input fields and sliders for Amount, Rate, and Tenure.

### 2. Month-by-Month Amortization Schedule
- Detailed breakdown of each payment (Principal vs. Interest).
- Highlights the **Break-even month** (where principal paid exceeds interest).
- **Chart Mode:** Visual stacked bar chart of the repayment schedule.
- Paginated data table for optimal performance.
- Export schedule directly to **CSV**.

### 3. Prepayment Planner
- Schedule one-time lump-sum prepayments at specific months.
- Instantly calculates exactly how much **Interest is Saved** and how much the **Tenure is Reduced**.
- Adjusted amortization schedule reflecting the prepayments.

### 4. Scenario Comparison
- Compare up to 3 different loan configurations (Amount, Rate, Tenure) side-by-side.
- Automatically highlights the scenario with the lowest total financial cost.
- Edits made in comparison mode seamlessly sync back to the main calculator.

### 5. What-If Sensitivity Grid
- A 7x7 analytical matrix showing how the EMI shifts across varying interest rates (±1%, ±2%, ±3%) and tenures (±6, ±12, ±24 months).
- Strict bounds clamping and deduplication for a clean UI.

### 6. Real-Time Cross-Tab Sync (No Backend Required)
- Uses the native browser **`BroadcastChannel` API** to sync the calculator state, scenarios, prepayments, and themes across multiple open tabs in real-time.
- **Tab Identity & Presence:** Tracks and displays how many tabs are currently open in the workspace.
- **Tab Leadership (Bonus):** Features a leader-election system. New tabs instantly request the current working state from the "Leader" tab, ensuring a flawless user experience without relying on local storage event hacks.
- **Dark/Light Mode Sync:** Toggling the theme in one tab instantly switches the theme across all active tabs.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Charting:** Recharts
- **State Management:** React Context API + Custom Broadcast Hooks

## 💻 Running Locally

To run this project on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YourUsername/advanced-emi-calculator.git](https://github.com/YourUsername/advanced-emi-calculator.git)
