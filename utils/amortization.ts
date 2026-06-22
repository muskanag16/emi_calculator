import { calculateEMI } from "./emi";

export interface AmortizationRow {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface ScheduleResult {
  rows: AmortizationRow[];
  breakEvenMonth: number;
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenure: number
): ScheduleResult {
  const rows: AmortizationRow[] = [];

  const emi = calculateEMI(
    principal,
    annualRate,
    tenure
  );

  const r = annualRate / 12 / 100;

  let balance = principal;

  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  let breakEvenMonth = -1;

  for (
    let month = 1;
    month <= tenure;
    month++
  ) {
    const interestPaid =
      balance * r;

    const principalPaid =
      emi - interestPaid;

    balance =
      balance - principalPaid;

    cumulativeInterest +=
      interestPaid;

    cumulativePrincipal +=
      principalPaid;

  if (breakEvenMonth === -1 && principalPaid >= interestPaid) {
  breakEvenMonth = month;
}

    rows.push({
      month,
      emi,
      principalPaid,
      interestPaid,
      balance:
        balance < 0 ? 0 : balance,
    });
  }

  return {
    rows,
    breakEvenMonth,
  };
}