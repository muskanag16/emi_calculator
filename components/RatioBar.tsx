
"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { calculateTotals } from "@/utils/emi";

// Helper function for Indian Rupee formatting (no red lines!)
const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

export default function RatioBar() {
  const { state } = useWorkspace();

  // Safely getting state values
  const currentAmount = state?.amount || 0;
  const currentRate = state?.rate || 0;
  const currentTenure = state?.tenure || 0;

  const { totalInterest, totalPayable } = calculateTotals(
    currentAmount,
    currentRate,
    currentTenure
  );

  // Avoiding division by zero NaN errors
  const principalShare = totalPayable > 0 ? (currentAmount / totalPayable) * 100 : 0;
  const interestShare = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  // Agar amount 0 hai, toh empty render karo
  if (!currentAmount) return null;

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mt-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-3 text-xs font-medium text-gray-500">
        <span>Principal vs Interest</span>
        <span>
          {principalShare.toFixed(1)}% / {interestShare.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 flex rounded-full overflow-hidden mb-4 bg-gray-100">
        <div
          className="bg-indigo-600 transition-all duration-500"
          style={{ width: `${principalShare}%` }}
        />
        <div
          className="bg-amber-500 transition-all duration-500"
          style={{ width: `${interestShare}%` }}
        />
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center gap-6 text-sm">
        
        {/* Principal Legend */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-[2px]"></div>
          <span className="text-gray-500">Principal</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(currentAmount)}
          </span>
        </div>

        {/* Interest Legend */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-[2px]"></div>
          <span className="text-gray-500">Interest</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(totalInterest)}
          </span>
        </div>

      </div>
    </div>
  );
}