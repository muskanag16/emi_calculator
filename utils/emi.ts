

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;

  // EDGE CASE FIX: 0% Interest Rate
  if (annualRate === 0) {
    return principal / tenureMonths;
  }

  const r = annualRate / 12 / 100;
  const emi =
    (principal * r * Math.pow(1 + r, tenureMonths)) /
    (Math.pow(1 + r, tenureMonths) - 1);

  return emi;
}

export function calculateTotals(
  principal: number,
  annualRate: number,
  tenureMonths: number
) {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  
  // EDGE CASE FIX: 0% Interest Rate
  if (annualRate === 0) {
    return {
      emi,
      totalInterest: 0,
      totalPayable: principal,
    };
  }

  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;

  return {
    emi,
    totalInterest: Math.max(0, totalInterest), // Prevents tiny negative floating points
    totalPayable,
  };
}