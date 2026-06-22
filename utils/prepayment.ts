
import { calculateEMI } from "./emi";
import { Prepayment } from "@/types/loan";

export interface PrepaymentRow {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  prepayment: number;
  balance: number;
}

export interface PrepaymentResult {
  rows: PrepaymentRow[];
  actualTenure: number;
  totalInterest: number;
}

export function generatePrepaymentSchedule(
  principal: number,
  annualRate: number,
  tenure: number,
  prepayments: Prepayment[]
): PrepaymentResult {
  const emi = calculateEMI(principal, annualRate, tenure);
  const r = annualRate / 12 / 100;

  // Edge Case 3: Summing multiple prepayments in same month
  const prepaymentMap = new Map<number, number>();
  prepayments.forEach((p) => {
    // Edge Case 2: Ignore if month beyond original tenure
    if (p.month <= tenure) {
      prepaymentMap.set(p.month, (prepaymentMap.get(p.month) || 0) + p.amount);
    }
  });

  let balance = principal;
  let totalInterest = 0;
  const rows: PrepaymentRow[] = [];

  // Loop through time. Using a limit to prevent infinite loops.
  for (let month = 1; month <= 600; month++) {
    if (balance <= 0) break;

    // 1. Apply Prepayment first (at the start of the month)
    let lumpSum = prepaymentMap.get(month) || 0;
    
    // Edge Case 1: Cap prepayment at remaining balance
    if (lumpSum > balance) {
      lumpSum = balance;
    }
    
    balance -= lumpSum;

    if (balance <= 0) {
      rows.push({ month, emi: 0, principalPaid: 0, interestPaid: 0, prepayment: lumpSum, balance: 0 });
      break;
    }

    // 2. Calculate Interest on reduced balance
    const interestPaid = balance * r;
    const principalPaid = Math.min(emi - interestPaid, balance);
    
    balance -= principalPaid;
    totalInterest += interestPaid;

    rows.push({
      month,
      emi,
      principalPaid,
      interestPaid,
      prepayment: lumpSum,
      balance: Math.max(0, balance),
    });
  }

  return {
    rows,
    actualTenure: rows.length,
    totalInterest,
  };
}