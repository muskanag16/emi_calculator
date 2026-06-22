
"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { calculateTotals } from "@/utils/emi";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function SummaryCards() {
  const { state } = useWorkspace();
  const isDark = state?.theme === "dark";
  
  const currentAmount = state?.amount || 0;
  const currentRate = state?.rate || 0;
  const currentTenure = state?.tenure || 0;

  const { emi, totalInterest, totalPayable } = calculateTotals(currentAmount, currentRate, currentTenure);
  const principalShare = totalPayable > 0 ? (currentAmount / totalPayable) * 100 : 0;
  const interestShare = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  if (!currentAmount) return null;

  return (
    <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
      <div className={`px-6 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <h2 className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Summary</h2>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-5 border rounded-xl transition-colors ${isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50/40 border-indigo-100"}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-indigo-400" : "text-gray-500"}`}>Monthly EMI</h3>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-500">{formatCurrency(emi)}</p>
          </div>
          <div className={`p-5 border rounded-xl transition-colors ${isDark ? "bg-[#13141f] border-gray-800" : "bg-gray-50/60 border-gray-100"}`}>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Interest</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{formatCurrency(totalInterest)}</p>
          </div>
          <div className={`p-5 border rounded-xl transition-colors ${isDark ? "bg-[#13141f] border-gray-800" : "bg-gray-50/60 border-gray-100"}`}>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Payable</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{formatCurrency(totalPayable)}</p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-2 text-xs font-medium text-gray-500">
            <span>Principal vs Interest</span>
            <span>{principalShare.toFixed(1)}% / {interestShare.toFixed(1)}%</span>
          </div>
          <div className={`h-2.5 flex rounded-full overflow-hidden mb-4 ${isDark ? "bg-[#13141f]" : "bg-gray-100"}`}>
            <div className="bg-indigo-600 transition-all duration-500" style={{ width: `${principalShare}%` }} />
            <div className="bg-amber-500 transition-all duration-500" style={{ width: `${interestShare}%` }} />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-[2px]"></div>
              <span className="text-gray-500">Principal</span>
              <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-800"}`}>{formatCurrency(currentAmount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-[2px]"></div>
              <span className="text-gray-500">Interest</span>
              <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-800"}`}>{formatCurrency(totalInterest)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}