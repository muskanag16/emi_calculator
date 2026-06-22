
"use client";

import { useMemo } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { calculateEMI } from "@/utils/emi";

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const formatTenure = (months: number) => {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return `${years > 0 ? years + 'y' : ''} ${rem > 0 ? rem + 'm' : ''}`.trim() || '0m';
};

export default function SensitivityGrid() {
  const { state } = useWorkspace();
  const isDark = state?.theme === "dark";

  const { amount, rate, tenure } = state;

  // FIX: 7 Rows (± 6, ± 12, ± 24) & Clamped exactly to 1 - 84 bounds
  const tenureVariations = useMemo(() => {
    const steps = [-24, -12, -6, 0, 6, 12, 24];
    const variations = steps.map(step => Math.min(84, Math.max(1, tenure + step)));
    return Array.from(new Set(variations)).sort((a, b) => a - b);
  }, [tenure]);

  // FIX: 7 Columns (± 1%, ± 2%, ± 3%) & Clamped exactly to 1 - 36 bounds
  const rateVariations = useMemo(() => {
    const steps = [-3, -2, -1, 0, 1, 2, 3];
    const variations = steps.map(step => Math.min(36, Math.max(1, rate + step)));
    return Array.from(new Set(variations)).sort((a, b) => a - b);
  }, [rate]);

  return (
    <div className={`border rounded-2xl shadow-sm overflow-hidden mb-8 transition-colors duration-300 ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
      
      <div className={`p-6 border-b pb-4 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>What-If Sensitivity Table</h2>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          A quick-reference grid showing how your EMI changes across a range of rates and tenures.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center whitespace-nowrap">
          <thead>
            <tr className={`border-b font-medium text-[13px] ${isDark ? "bg-[#13141f] border-gray-800 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
              <th className={`py-3.5 px-6 font-medium text-left border-r ${isDark ? "border-gray-800" : "border-gray-200/60"}`}>
                Tenure \ Rate
              </th>
              {/* Columns: Rates */}
              {rateVariations.map((r) => (
                <th key={r} className="py-3.5 px-6 font-medium">
                  {r}%
                  {r === rate && (
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                      Current
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Rows: Tenures */}
            {tenureVariations.map((t) => (
              <tr key={t} className={`border-b last:border-none transition-colors duration-150 ${isDark ? "border-gray-800/70" : "border-gray-100"}`}>
                <td className={`py-3.5 px-6 font-semibold text-left border-r ${isDark ? "text-gray-300 border-gray-800" : "text-gray-700 border-gray-200/60"}`}>
                  {formatTenure(t)}
                  {t === tenure && (
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                      Current
                    </span>
                  )}
                </td>
                
                {/* Cells: EMIs */}
                {rateVariations.map((r) => {
                  const gridEmi = calculateEMI(amount, r, t);
                  const isCurrentBase = r === rate && t === tenure;

                  return (
                    <td 
                      key={`${r}-${t}`} 
                      className={`py-3.5 px-6 transition-colors duration-150 ${
                        isCurrentBase 
                          ? (isDark ? "bg-blue-900/20 text-blue-400 font-bold" : "bg-blue-50/60 text-blue-600 font-bold") 
                          : (isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50/40")
                      }`}
                    >
                      {formatCurrency(gridEmi)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}